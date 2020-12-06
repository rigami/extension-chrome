import BusApp, { eventToApp, eventToBackground, instanceId } from '@/stores/backgroundApp/busApp';
import { assign, throttle } from 'lodash';
import FSConnector from '@/utils/fsConnector';
import { action, makeAutoObservable } from 'mobx';

class SyncStorage {
    bus;
    storage;

    constructor() {
        makeAutoObservable(this);
        this.bus = BusApp();

        console.log(this.bus)
        this.storage = {};

        try {
            console.log('Getting storage from fast cache');
            this.storage = { ...JSON.parse(localStorage.getItem('storage')) };

            this.fastSync();
        } catch (e) {
            console.log('Not find fast cache or broken. Get from old cache');

            FSConnector.getFileAsText('/storage.json')
                .then((props) => {
                    this.storage = { ...JSON.parse(props) };
                    this.fastSync();
                })
                .catch(console.error);
        }

        this.bus.on('system/syncStorage', (storage, { initiatorId }) => {
            this._syncStorage(storage, initiatorId);
        });

        this.bus.on('system/getStorage', (storage, props, callback) => {
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
        console.log('updatePersistent', props);
        this._syncStorage(props, instanceId);
    }

    fastSync = throttle(() => {
        console.log('Save fast cache storage', this.storage);
        localStorage.setItem('storage', JSON.stringify(this.storage));
    }, 100);

    sync = throttle(() => {
        console.log('Save settings', this.storage);

        FSConnector.saveFile(
            '/storage.json',
            new Blob([JSON.stringify(this.storage)], { type: 'application/json' }),
        ).then(() => {
            console.log('Success save cache storage');
        });
    }, 7000);
}

export default SyncStorage;
