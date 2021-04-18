import { getUrl, getBgUrl, getIconUrl } from './utils';
import FSConnector from './connector';

let _fs = null;
const openAwaitRequests = [];

const methodPromise = (args, method) => new Promise((resolve, reject) => {
    openAwaitRequests.push({
        resolve,
        reject,
        method,
        args,
    });
});

const promiseStub = {
    ls: (...args) => methodPromise(args, 'ls'),
    mkdir: (...args) => methodPromise(args, 'mkdir'),
    save: (...args) => methodPromise(args, 'save'),
    get: (...args) => methodPromise(args, 'get'),
    remove: (...args) => methodPromise(args, 'remove'),
};

const open = () => new Promise((resolve, reject) => {
    navigator.webkitPersistentStorage.requestQuota(
        1024 * 1024 * 1024,
        (grantedBytes) => window.webkitRequestFileSystem(window.PERSISTENT, grantedBytes, resolve, reject),
        reject,
    );
})
    .then((fs) => {
        _fs = new FSConnector(fs.root);

        openAwaitRequests.forEach(({ resolve, method, args }) => resolve(_fs[method](...args)));
    });

const fs = () => _fs || promiseStub;

export {
    open,
    getUrl,
    getBgUrl,
    getIconUrl,
};
export default fs;
