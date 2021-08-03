import appVariables from '@/config/appVariables';
import fetchData from '@/utils/helpers/fetchData';
import parseSite, { getDomain } from '@/utils/localSiteParse';
import { captureException } from '@sentry/react';

const search = async (query, signal) => {
    const response = await fetchData(
        `${
            PRODUCTION_MODE
                ? 'https://duckduckgo.com/lite/?q'
                : `${appVariables.rest.url}/site/proxy-duck-duck-go?query`
        }=${query}`,
        {
            responseType: 'document',
            signal,
        },
    ).then((body) => body.response);

    return Array.from(response.body.querySelectorAll('.result-link')).map((link) => ({
        url: link.href,
        title: link.innerHTML.replace(/<(b|span)[^>]*>|<\/(b|span)>/g, ''),
    }));
};

const getImageRecalc = (icoUrl, signal) => fetchData(
    icoUrl,
    { signal },
).then(({ response }) => response);

const getSiteInfoLocal = async (url) => {
    let localSearchUrl = url;

    if (localSearchUrl.indexOf('http') !== 0) {
        localSearchUrl = `http://${localSearchUrl}`;
    }

    const { response, raw } = await fetchData(
        localSearchUrl,
        { responseType: 'arrayBuffer' },
    );

    const contentType = raw.headers.get('content-type');
    const charset = contentType.indexOf('charset=') !== -1
        ? contentType.slice(contentType.indexOf('charset=') + 8)
        : 'UTF-8';

    const result = new TextDecoder(charset).decode(response);
    const urlOrigin = raw.url.substring(0, raw.url.indexOf('/', 'http://'.length + 1));

    let parseData = {};

    try {
        parseData = { ...parseSite(result, urlOrigin) };
    } catch (e) {
        captureException(e);
        console.log('Failed parse site', e);
    }

    console.log('local parse data:', {
        ...parseData,
        url: raw.url,
        baseUrl: localSearchUrl,
        urlOrigin,
    }, raw);

    return {
        ...parseData,
        title: parseData.title || getDomain(raw.url),
        url: raw.url,
        baseUrl: localSearchUrl,
        urlOrigin,
    };
};

const getSiteInfo = async (url, onMeta) => {
    const localParseData = await getSiteInfoLocal(url);

    console.log('localParseData:', localParseData);

    if (onMeta) {
        onMeta({
            title: localParseData.title,
            description: localParseData.description,
        });
    }

    try {
        const { response: result } = await fetchData(
            `${appVariables.rest.url}/site-parse/add-data`,
            {
                body: JSON.stringify(localParseData),
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                responseType: 'json',
            },
        );

        if (!result?.icons) throw new Error('Broken result');

        return result;
    } catch (e) {
        console.error(e);

        return localParseData;
    }
};

export {
    search,
    getSiteInfo,
    getImageRecalc,
    getSiteInfoLocal,
};
