import { eventToApp, instanceId } from '@/stores/server/bus';
import { assign, throttle } from 'lodash';
import fs from '@/utils/fs';
import { action, makeAutoObservable, toJS } from 'mobx';
import { captureException } from '@sentry/react';

class StorageService {
    core;
    storage;

    constructor(core) {
        makeAutoObservable(this);
        this.core = core;
        this.storage = {};

        try {
            console.log('[storage] Getting storage from fast cache...');
            this.storage = { ...JSON.parse(localStorage.getItem('storage')) };
            console.log('[storage]', toJS(this.storage));
        } catch (e) {
            console.log('[storage] Not find fast cache or broken. Get from file cache...');
            captureException(e);

            fs().get('/storage.json', { type: 'text' })
                .then((props) => {
                    this.storage = { ...JSON.parse(props) };
                    this.fastSync();
                })
                .catch((e2) => {
                    console.error('[storage] Failed read storage from file:', e2);
                    captureException(e2);
                });
        }

        this.core.globalBus.on('system/syncStorage', (storage, { initiatorId }) => {
            this._syncStorage(storage, initiatorId);
        });

        this.core.globalBus.on('system/getStorage', (storage, props, callback) => {
            callback(this.storage);
            this.sync();
            this.fastSync();
        });
    }

    _syncStorage(storage, initiatorId) {
        eventToApp('system/syncStorage', {
            storage,
            changeInitiatorId: initiatorId,
        });
        assign(this.storage, storage);
        this.sync();
        this.fastSync();
    }

    @action
    updatePersistent(props = {}) {
        console.log('[storage] updatePersistent', props);
        this._syncStorage(props, instanceId);
    }

    fastSync = throttle(() => {
        console.log('[storage] Save fast cache storage', this.storage);
        localStorage.setItem('storage', JSON.stringify(this.storage));
    }, 100);

    sync = throttle(() => {
        console.log('[storage] Save settings', this.storage);

        fs().save(
            '/storage.json',
            new Blob([JSON.stringify(this.storage)], { type: 'application/json' }),
        ).then(() => {
            console.log('[storage] Success save cache storage');
        });
    }, 7000);
}

export default StorageService;
