import { openDB } from 'idb/with-async-ittr';
import configureDB from '@/config/db';
import { SERVICE_STATE } from '@/enum';
import forceCrash from '@/utils/helpers/forceCrash';
import appVariables from '../config/config';
import consoleBinder from '@/utils/console/bind';

let _db = null;
const openAwaitRequests = [];
let state = SERVICE_STATE.WAIT;
const bindConsole = consoleBinder('db');

async function open() {
    if (state !== SERVICE_STATE.WAIT && state !== SERVICE_STATE.STOP) return;

    bindConsole.log('Opening...');
    state = SERVICE_STATE.INSTALL;

    try {
        const db = await openDB(
            appVariables.db.name,
            appVariables.db.version,
            configureDB({
                upgrade() {
                    bindConsole.log('Upgrade');
                },
                blocked() {
                    bindConsole.log('Blocked');
                },
                blocking() {
                    bindConsole.log('Blocking');
                },
                terminated() {
                    bindConsole.log('Terminated');
                },
            }),
        );

        bindConsole.log('Open!');
        _db = db;
        openAwaitRequests.forEach(({ resolve, method, args }) => resolve(db[method](...args)));
        openAwaitRequests.length = 0;
        state = SERVICE_STATE.DONE;
    } catch (e) {
        state = SERVICE_STATE.FAILED;
        forceCrash(e || new Error('ERR_INIT_DB'));
    }
}

const methodPromise = (method, args) => new Promise((resolve, reject) => {
    openAwaitRequests.push({
        resolve,
        reject,
        method,
        args,
    });

    if (state === SERVICE_STATE.WAIT) open();
});

const promiseStub = {
    get: (...args) => methodPromise('get', args),
    getKey: (...args) => methodPromise('getKey', args),
    getAll: (...args) => methodPromise('getAll', args),
    getAllKeys: (...args) => methodPromise('getAllKeys', args),
    count: (...args) => methodPromise('count', args),
    put: (...args) => methodPromise('put', args),
    add: (...args) => methodPromise('add', args),
    delete: (...args) => methodPromise('delete', args),
    clear: (...args) => methodPromise('clear', args),
    getFromIndex: (...args) => methodPromise('getFromIndex', args),
    getKeyFromIndex: (...args) => methodPromise('getKeyFromIndex', args),
    getAllFromIndex: (...args) => methodPromise('getAllFromIndex', args),
    getAllKeysFromIndex: (...args) => methodPromise('getAllKeysFromIndex', args),
    countFromIndex: (...args) => methodPromise('countFromIndex', args),
    transaction: (...args) => methodPromise('transaction', args),
};

export default () => _db || promiseStub;
