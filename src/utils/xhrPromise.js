const xhrPromise = (url, options = {}) => new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(options.method || 'GET', url, true);
    xhr.timeout = 30000;
    xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
    if (options.headers) {
        options.headers.forEach(({ name, value }) => {
            xhr.setRequestHeader(name, value);
        });
    }
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
        case 'json':
            resolve({
                response: xhr.response,
                xhr,
            });
            break;
        case 'document':
            resolve({
                response: xhr.responseXML,
                xhr,
            });
            break;
        default:
            resolve({
                response: xhr.response,
                xhr,
            });
            break;
        }
    };

    xhr.onerror = xhr.ontimeout = (e) => {
        reject(e);
    };

    xhr.send(options.body);
});

function AbortController() {
    const _handlers = [];

    this.abort = () => {
        _handlers.forEach((handler) => handler());
    };
    this.addAbortHandler = (handler) => _handlers.push(handler);
}

export default xhrPromise;
export { AbortController };
