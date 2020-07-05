const xhrPromise = (url, options = {}) => {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.timeout = 30000;
        xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
        xhr.responseType = options.responseType || 'json';

        if (options.signal) {
            options.signal.addAbortHandler(() => xhr.abort());
        }

        xhr.onload = () => {
            if (xhr.status !== 200) {
                reject({
                    code: xhr.status,
                    message: xhr.statusText,
                });
                return;
            }
            switch (options.responseType) {
                case "json":
                    resolve(xhr.response);
                    break;
                case "document":
                    resolve(xhr.responseXML);
                    break;
                default:
                    resolve(xhr.response);
                    break;
            }

        }

        xhr.onerror = xhr.ontimeout = (e) => {
            reject(e);
        }

        xhr.send();
    });
};


function AbortController() {
    const _handlers = [];

    this.abort = () => {
        _handlers.forEach((handler) => handler());
    }
    this.addAbortHandler = (handler) => _handlers.push(handler);
}

export default xhrPromise;
export { AbortController };
