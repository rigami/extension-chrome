import { getUrl } from './utils';

const _fs = null;
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

const fs = () => _fs || promiseStub;

export { getUrl };
export default fs;
