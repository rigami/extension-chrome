import BusApp, { eventToApp } from '@/stores/backgroundApp/busApp';
import { assign, throttle } from 'lodash';
import FSConnector from '@/utils/fsConnector';

class SyncStorage {
    bus;
    storage;

    constructor() {
        this.bus = BusApp();
        this.storage = {};
        const fastSyncStorage = throttle(() => this.fastSync(), 1000);
        const syncStorage = throttle(() => this.sync(), 10000);

        try {
            console.log('Getting storage from fast cache');
            this.storage = { ...JSON.parse(localStorage.getItem('storage')) };

            fastSyncStorage();
        } catch (e) {
            console.log('Not find fast cache or broken. Get from old cache');

            FSConnector.getFileAsText('/storage.json')
                .then((props) => {
                    this.storage = { ...JSON.parse(props) };
                    fastSyncStorage();
                })
                .catch(console.error);
        }

        this.bus.on('system/syncStorage', (storage, { initiatorId }) => {
            eventToApp('system/syncStorage', {
                storage,
                changeInitiatorId: initiatorId,
            });
            assign(this.storage, storage);
            syncStorage();
            fastSyncStorage();
        });

        this.bus.on('system/getStorage', (storage, props, callback) => {
            callback(this.storage);
            syncStorage();
            fastSyncStorage();
        });
    }

    fastSync() {
        console.log('Save fast cache storage', this.storage);
        localStorage.setItem('storage', JSON.stringify(this.storage));
    }

    sync() {
        console.log('Save settings', this.storage);

        FSConnector.saveFile(
            '/storage.json',
            new Blob([JSON.stringify(this.storage)], { type: 'application/json' }),
        ).then(() => {
            console.log('Success save cache storage');
        });
    }
}

export default SyncStorage;
