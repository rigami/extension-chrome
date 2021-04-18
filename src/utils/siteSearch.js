import appVariables from '@/config/appVariables';
import xhrPromise, { AbortController } from '@/utils/xhrPromise';
import parseSite from '@/utils/localSiteParse';

const search = async (query, signal) => {
    const response = await xhrPromise(
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

const getImageRecalc = (imageUrl, signal) => xhrPromise(
    imageUrl,
    { signal },
).then(({ response }) => response);

const getSiteInfoLocal = async (url) => {
    let localSearchUrl = url;

    if (localSearchUrl.indexOf('http') !== 0) {
        localSearchUrl = `http://${localSearchUrl}`;
    }

    const { response, xhr } = await xhrPromise(
        localSearchUrl,
        { responseType: 'document' },
    );

    const urlOrigin = xhr.responseURL.substring(0, xhr.responseURL.indexOf('/', 'http://'.length + 1));

    let parseData = {};

    try {
        parseData = { ...parseSite(response, urlOrigin) };
    } catch (e) {
        console.log('Failed parse site', e);
    }

    console.log('local parse data:', {
        ...parseData,
        url: xhr.responseURL,
        baseUrl: localSearchUrl,
        urlOrigin,
    });

    return {
        ...parseData,
        url: xhr.responseURL,
        baseUrl: localSearchUrl,
        urlOrigin,
    };
};

const getSiteInfo = async (url, onMeta) => {
    const localParseData = await getSiteInfoLocal(url);

    if (onMeta) {
        onMeta({
            title: localParseData.title,
            description: localParseData.description,
        });
    }

    const { response: result } = await xhrPromise(
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

    return result;
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
    AbortController,
    getSiteInfo,
    getImageRecalc,
    getSiteInfoLocal,
};
