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
    cd: (...args) => methodPromise(args, 'cd'),
    mkdir: (...args) => methodPromise(args, 'mkdir'),
    write: (...args) => methodPromise(args, 'write'),
    read: (...args) => methodPromise(args, 'read'),
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

        console.log(_fs);

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
