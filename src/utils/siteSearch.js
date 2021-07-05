import appVariables from '@/config/appVariables';
import fetchData from '@/utils/fetchData';
import parseSite from '@/utils/localSiteParse';
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
        { responseType: 'text' },
    );

    const urlOrigin = raw.url.substring(0, raw.url.indexOf('/', 'http://'.length + 1));

    let parseData = {};

    try {
        parseData = { ...parseSite(response, urlOrigin) };
    } catch (e) {
        captureException(e);
        console.log('Failed parse site', e);
    }

    console.log('local parse data:', {
        ...parseData,
        url: raw.responseURL,
        baseUrl: localSearchUrl,
        urlOrigin,
    });

    return {
        ...parseData,
        url: raw.responseURL,
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
                headers: [
                    {
                        name: 'Content-type',
                        value: 'application/json',
                    },
                ],
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

const getFaviconUrl = (url = '') => {
    let origin;
    if (url.indexOf('/', 8) === -1) {
        origin = url;
    } else {
        origin = url.substring(0, url.indexOf('/', 8));
    }

    return `${origin}/favicon.ico`;
};

export {
    search,
    getFaviconUrl,
    getSiteInfo,
    getImageRecalc,
    getSiteInfoLocal,
};
