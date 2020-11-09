import appVariables from '@/config/appVariables';
import xhrPromise, { AbortController } from '@/utils/xhrPromise';
import { last } from 'lodash';
import parseSite from '@/utils/localSiteParse';

const search = async (query, signal) => {
    const response = await xhrPromise(
        `${
            PRODUCTION_MODE
                ? 'https://duckduckgo.com/lite/?q'
                : `${appVariables.rest.url}/site/proxy_DuckDuckGo?query`
        }=${query}`,
        {
            responseType: 'document',
            signal,
        },
    ).then(({ response }) => response);

    return Array.from(response.body.querySelectorAll('.result-link')).map((link) => ({
        url: link.href,
        title: link.innerHTML.replace(/<(b|span)[^>]*>|<\/(b|span)>/g, ''),
    }));
};

const getImageRecalc = (imageUrl, signal) => xhrPromise(
    imageUrl,
    { signal },
).then(({ response }) => response);

const getSiteInfo = (url, signal) => xhrPromise(
    `${appVariables.rest.url}/site_parse/get_data?url=${url}`,
    { signal },
).then(({ response }) => response);


const getSiteInfoLocal = async (url, signal) => {
    let localSearchUrl = url;

    if (localSearchUrl.indexOf('http') !== 0) {
        localSearchUrl = `http://${localSearchUrl}`
    }

    const { response, xhr } = await xhrPromise(
        localSearchUrl,
        { signal, responseType: 'document' },
    );

    const urlOrigin = xhr.responseURL.substring(0, xhr.responseURL.indexOf('/', 'http://'.length+1));

    const parseResult = {
        ...parseSite(response, urlOrigin),
        url: xhr.responseURL,
        urlOrigin,
    };

    const { response: result } = await xhrPromise(
        `${appVariables.rest.url}/site_parse/add_data`,
        {
            body: JSON.stringify(parseResult),
            method: 'POST',
            headers: [
                { name: "Content-type", value: "application/json" },
            ],
            responseType: 'json',
        },
    )

    return result;
}

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
