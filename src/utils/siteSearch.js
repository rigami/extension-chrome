const search = (query, signal) => {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', `http://localhost:8080/site/proxy_DuckDuckGo?query=${query}`, true);
        xhr.responseType = "document";
        xhr.timeout = 30000;
        xhr.setRequestHeader("Access-Control-Allow-Origin", "*");

        if (signal) {
            signal.addAbortHandler(() => xhr.abort());
        }

        xhr.onload = () => {
            if (xhr.status !== 200) {
                reject(xhr.status);
                return;
            }
            resolve(Array.from(xhr.responseXML.body.querySelectorAll(".result-link")).map((link) => ({
                url: link.href,
                title: link.innerHTML.replace(/<(b|span)[^>]*>|<\/(b|span)>/g, ""),
            })));
        }

        xhr.onerror = xhr.ontimeout = (e) => {
            reject(e);
        }

        xhr.send();
    });
};

const getImageRecalc = (url, signal) => {
    console.log("RECALC IMAGE", url)
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.timeout = 30000;
        xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
        xhr.responseType = 'json';

        if (signal) {
            signal.addAbortHandler(() => xhr.abort());
        }

        xhr.onload = () => {
            if (xhr.status !== 200) {
                reject();
                return;
            }
            resolve(xhr.response);
        }

        xhr.onerror = xhr.ontimeout = (e) => {
            reject(e);
        }

        xhr.send();
    });
};

const checkExistSite = (url, signal) => {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', `http://localhost:8080/site_parse/get_data?url=${url}`, true);
        xhr.timeout = 30000;
        xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
        xhr.responseType = 'json';

        if (signal) {
            signal.addAbortHandler(() => xhr.abort());
        }

        xhr.onload = () => {
            if (xhr.status !== 200) {
                reject();
                return;
            }
            resolve(xhr.response);
        }

        xhr.onerror = xhr.ontimeout = (e) => {
            reject(e);
        }

        xhr.send();
    });
};

const getSiteInfo = (url, signal) => {
    return checkExistSite(url, signal);
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

function AbortController() {
    const _handlers = [];

    this.abort = () => {
        _handlers.forEach((handler) => handler());
    }
    this.addAbortHandler = (handler) => _handlers.push(handler);
}


export default search;
export { getFaviconUrl, AbortController, checkExistSite, getSiteInfo, getImageRecalc };
