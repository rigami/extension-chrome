const search = (query, signal) => {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', `http://localhost:8080/parser/proxy_DuckDuckGo?query=${encodeURI(query)}`, true);
        xhr.responseType = "document";
        xhr.timeout = 10000;
        xhr.setRequestHeader("Access-Control-Allow-Origin", "*");

        if (signal) {
            signal._abortHandler = () => xhr.abort();
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

const getFaviconUrl = (url) => {
    let origin;
    if (url.indexOf("/", 8) === -1) {
        origin = url;
    } else {
        origin = url.substring(0, url.indexOf("/", 8))
    }

    return `${origin}/favicon.ico`;
};

function AbortController() {
    this.abort = () => this._abortHandler && this._abortHandler();
    this._abortHandler = null;
}


export default search;
export { getFaviconUrl, AbortController };
