import { openDB } from 'idb/with-async-ittr.js';
import dbConfig from '@/config/db';
import { SERVICE_STATE } from '@/enum';
import forceCrash from '@/utils/helpers/forceCrash';
import appVariables from '../config/appVariables';

let _db = null;
const openAwaitRequests = [];
let state = SERVICE_STATE.WAIT;

async function open() {
    if (state !== SERVICE_STATE.WAIT && state !== SERVICE_STATE.STOP) return;

    console.log('Opening db...');
    state = SERVICE_STATE.INSTALL;

    try {
        const db = await openDB(
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
        );

        console.log('db is open!');
        _db = db;
        openAwaitRequests.forEach(({ resolve, method, args }) => resolve(db[method](...args)));
        state = SERVICE_STATE.DONE;
    } catch (e) {
        state = SERVICE_STATE.FAILED;
        forceCrash(e || new Error('ERR_INIT_DB'));
    }
}

const methodPromise = (args, method) => new Promise((resolve, reject) => {
    openAwaitRequests.push({
        resolve,
        reject,
        method,
        args,
    });
    open();
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

export default () => _db || promiseStub;
