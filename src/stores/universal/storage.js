import {
    action,
    computed,
    makeAutoObservable,
    makeObservable,
    observable,
    runInAction, toJS,
} from 'mobx';
import { assign, throttle } from 'lodash';
import BrowserAPI from '@/utils/browserAPI';
import { captureException } from '@sentry/react';
import { SERVICE_STATE } from '@/enum';

class StorageConnector {
    static async get(keyOrKeys) {
        console.log('[StorageConnector] Get item:', keyOrKeys);

        return new Promise((resolve) => (
            BrowserAPI.localStorage.get(keyOrKeys, (data) => resolve(data || {}))
        ));
    }

    static async set(data) {
        console.log('[StorageConnector] Set item:', data);
        return new Promise((resolve) => BrowserAPI.localStorage.set(
            JSON.parse(JSON.stringify(data)),
            () => resolve(data),
        ));
    }

    static async remove(keyOrKeys) {
        console.log('[StorageConnector] Remove item:', keyOrKeys);
        return new Promise((resolve) => BrowserAPI.localStorage.remove(keyOrKeys, resolve));
    }
}

class PersistentStorage {
    _data;
    namespace;
    _updateTimestamp = Date.now();
    state = SERVICE_STATE.WAIT;

    constructor(namespace, upgradeState) {
        makeObservable(this, {
            _data: observable,
            state: observable,
            update: action,
            data: computed,
            subscribe: action,
        });

        this.namespace = namespace;
        this.subscribe(upgradeState);
    }

    sync = throttle(() => {
        console.log(`[storage] Update '${this.namespace}' data from cache`, toJS(this._data));
        this._updateTimestamp = Date.now();
        StorageConnector.set({
            [this.namespace]: {
                ...this._data,
                updateTimestamp: this._updateTimestamp,
            },
        })
            .then(() => console.log(`[storage] '${this.namespace}' is update`));
    }, 100);

    @action
    update(changeData = {}) {
        console.log('super update', this.namespace, changeData);
        assign(this._data, changeData);
        this.sync();
    }

    @computed
    get data() {
        return this._data;
    }

    @action
    async subscribe(upgradeState) {
        console.log(`[storage] Subscribe to '${this.namespace}' namespace${upgradeState ? ' and upgrade...' : '...'}`);
        this.state = SERVICE_STATE.INSTALL;
        this._data = {};

        try {
            const t = await StorageConnector.get(this.namespace, {});
            console.log(t);
            let { [this.namespace]: data = {} } = await StorageConnector.get(this.namespace, {});

            data = upgradeState ? upgradeState(data) : data;

            console.log(`[storage] Data from '${this.namespace}' namespace:`, JSON.stringify(data));

            if (!data) throw new Error(`Storage '${this.namespace}' not exist`);

            runInAction(() => {
                assign(this._data, data);
                console.log(this.namespace, JSON.stringify(this._data), JSON.stringify(data));
                this.state = SERVICE_STATE.DONE;
            });

            if (upgradeState) {
                this.sync();
            }
        } catch (e) {
            console.warn('Failed get app settings from cache', e);
            captureException(e);
            runInAction(() => {
                this.state = SERVICE_STATE.FAILED;
            });
        }

        BrowserAPI.onChangeStorage((changes, namespace) => {
            if (
                namespace === 'local'
                && this.namespace in changes
                && this._updateTimestamp < changes[this.namespace].newValue.updateTimestamp
            ) {
                console.log(
                    `[storage] Data from '${this.namespace}' namespace has changed. Update cache...`,
                    changes[this.namespace],
                );
                assign(this._data, changes[this.namespace].newValue);
            }
        });
    }
}

class TempStorage {
    _data = {};

    constructor() {
        makeAutoObservable(this);
    }

    @computed
    get data() {
        return this._data;
    }

    @action
    update(changeData = {}) {
        assign(this._data, changeData);
    }
}

class Storage {
    temp;
    persistent;

    constructor(namespace, upgrade) {
        makeAutoObservable(this);
        this.temp = new TempStorage();
        this.persistent = new PersistentStorage(namespace, upgrade && (() => ({})));
    }
}

export default Storage;

export {
    TempStorage,
    PersistentStorage,
    StorageConnector,
};
