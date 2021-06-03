import { openDB } from 'idb/with-async-ittr.js';
import dbConfig from '@/config/db';
import appVariables from '../config/appVariables';

let _db = null;
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
    get: (...args) => methodPromise(args, 'get'),
    getKey: (...args) => methodPromise(args, 'getKey'),
    getAll: (...args) => methodPromise(args, 'getAll'),
    getAllKeys: (...args) => methodPromise(args, 'getAllKeys'),
    count: (...args) => methodPromise(args, 'count'),
    put: (...args) => methodPromise(args, 'put'),
    add: (...args) => methodPromise(args, 'add'),
    delete: (...args) => methodPromise(args, 'delete'),
    clear: (...args) => methodPromise(args, 'clear'),
    getFromIndex: (...args) => methodPromise(args, 'getFromIndex'),
    getKeyFromIndex: (...args) => methodPromise(args, 'getKeyFromIndex'),
    getAllFromIndex: (...args) => methodPromise(args, 'getAllFromIndex'),
    getAllKeysFromIndex: (...args) => methodPromise(args, 'getAllKeysFromIndex'),
    countFromIndex: (...args) => methodPromise(args, 'countFromIndex'),
    transaction: (...args) => methodPromise(args, 'transaction'),
};

const open = () => openDB(
    appVariables.db.name,
    appVariables.db.version,
    dbConfig({
        upgrade() {
            console.log('upgrade');
        },
        blocked() {
            console.log('blocked');
        },
        blocking() {
            console.log('blocking');
        },
        terminated() {
            console.log('terminated');
        },
    }),
)
    .then((db) => {
        console.log('db is open!');
        _db = db;
        openAwaitRequests.forEach(({ resolve, method, args }) => resolve(db[method](...args)));
    });

export { open };
export default () => _db || promiseStub;
