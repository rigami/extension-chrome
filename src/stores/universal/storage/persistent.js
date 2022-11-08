import {
    action,
    computed,
    makeObservable,
    observable,
    runInAction,
    toJS,
} from 'mobx';
import { assign, throttle } from 'lodash';
import { captureException } from '@sentry/browser';
import { SERVICE_STATE } from '@/enum';
import BrowserAPI from '@/utils/browserAPI';
import StorageConnector from './connector';

class PersistentStorage {
    @observable _data = {};
    namespace;
    _updateTimestamp = Date.now();
    @observable state = SERVICE_STATE.WAIT;

    constructor(namespace, upgradeState) {
        makeObservable(this);

        this.namespace = namespace;
        this.subscribe(upgradeState);
    }

    _forceSync() {
        console.log(`[storage] Update '${this.namespace}' data from cache`, toJS(this._data));
        this._updateTimestamp = Date.now();
        StorageConnector.set({
            [this.namespace]: {
                ...this._data,
                updateTimestamp: this._updateTimestamp,
            },
        })
            .then(() => console.log(`[storage] '${this.namespace}' is update`));
    }

    sync = throttle(() => {
        this._forceSync();
    }, 100);

    @action
    update(changeData = {}, force = false) {
        console.log('super update', this.namespace, changeData, toJS(this._data));

        runInAction(() => {
            assign(this._data, changeData);
        });
        console.log('super after update', this.namespace, changeData, toJS(this._data));
        if (force) this._forceSync(); else this.sync();
    }

    @computed
    get data() {
        return this._data;
    }

    @action.bound
    async subscribe(upgradeState) {
        console.log(`[storage] Subscribe to '${this.namespace}' namespace${upgradeState ? ' and upgrade...' : '...'}`);
        this.state = SERVICE_STATE.INSTALL;
        this._data = {};

        try {
            // const t = await StorageConnector.get(this.namespace, {});
            let { [this.namespace]: data = {} } = await StorageConnector.get(this.namespace, {});

            data = upgradeState ? upgradeState(data) : data;

            // console.log(`[storage] Data from '${this.namespace}' namespace:`, JSON.stringify(data));

            if (!data) throw new Error(`Storage '${this.namespace}' not exist`);

            runInAction(() => {
                assign(this._data, data);
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

                runInAction(() => {
                    assign(this._data, changes[this.namespace].newValue);
                });
            }
        });
    }
}

export default PersistentStorage;
