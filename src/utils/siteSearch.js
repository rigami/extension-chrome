import appVariables from "@/config/appVariables";
import xhrPromise, { AbortController } from "@/utils/xhrPromise";

const search = async (query, signal) => {
    const response = xhrPromise(`${appVariables.rest.url}/site/proxy_DuckDuckGo?query=${query}`, {
        responseType: "document",
        signal,
    })

    return Array.from(response.body.querySelectorAll(".result-link")).map((link) => ({
        url: link.href,
        title: link.innerHTML.replace(/<(b|span)[^>]*>|<\/(b|span)>/g, ""),
    }));
};

const getImageRecalc = (imageName, signal) => {
    return xhrPromise(`${appVariables.rest.url}/icon_parse/recalc/${imageName}`, {
        signal,
    });
};

const getSiteInfo = (url, signal) => {
    return xhrPromise(`${appVariables.rest.url}/site_parse/get_data?url=${url}`, {
        signal,
    });
};

const getFaviconUrl = (url = '') => {
    let origin;
    if (url.indexOf("/", 8) === -1) {
        origin = url;
    } else {
        origin = url.substring(0, url.indexOf("/", 8))
    }

    return `${origin}/favicon.ico`;
};

export { search, getFaviconUrl, AbortController, getSiteInfo, getImageRecalc };
