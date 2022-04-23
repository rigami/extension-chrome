import { captureException } from '@sentry/react';
import appVariables from '@/config/config';
import fetchData from '@/utils/helpers/fetchData';
import parseSite, { getDomain } from '@/utils/localSiteParse';
import api from '@/utils/helpers/api';

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

const getImageRecalc = (icoUrl) => api.get(icoUrl.substring(1)).then(({ response, raw }) => response);

const getImage = async (icoUrl) => {
    const { raw, response } = await api.get(icoUrl, { responseType: 'arrayBuffer' });

    return {
        buffer: response,
        url: api.computeUrl(icoUrl),
        score: +raw.headers.get('image-score'),
        type: raw.headers.get('image-type'),
        icoVariant: raw.headers.get('image-type')?.toUpperCase(),
        availableVariants: (raw.headers.get('image-recommended-types') || '').toUpperCase().split(','),
        sourceUrl: raw.headers.get('image-base-url'),
    };
};

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
        const { response: result } = await api.get(
            'site-parse/get-meta',
            { query: { url } },
        );

        if (!result?.images) throw new Error('Broken result');

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
    getImage,
};
