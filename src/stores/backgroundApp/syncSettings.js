import BusApp, { eventToApp } from '@/stores/backgroundApp/busApp';
import { assign, throttle } from 'lodash';
import defaultSettings from '@/config/settings';
import FSConnector from '@/utils/fsConnector';

class SyncSettings {
    bus;
    settings;

    constructor() {
        this.bus = BusApp();
        this.settings = {
            app: {},
            bookmarks: {},
            backgrounds: {},
        };
        const fastSyncSettings = throttle(() => this.fastSync(), 1000);
        const syncSettings = throttle(() => this.sync(), 10000);

        try {
            console.log('Getting settings from fast cache');
            this.settings = { ...JSON.parse(localStorage.getItem('settings')) };

            fastSyncSettings();
        } catch (e) {
            console.log('Not find fast cache or broken. Get from old cache');

            FSConnector.getFileAsText('/settings.json')
                .then((props) => {
                    this.settings = { ...JSON.parse(props) };
                    fastSyncSettings();
                })
                .catch(console.error);
        }

        this.bus.on('system/syncSettings/app', (settings, { initiatorId }) => {
            eventToApp('system/syncSettings/app', {
                settings,
                changeInitiatorId: initiatorId,
            });
            assign(this.settings.app, settings);
            syncSettings();
            fastSyncSettings();
        });
        this.bus.on('system/syncSettings/bookmarks', (settings, { initiatorId }) => {
            eventToApp('system/syncSettings/bookmarks', {
                settings,
                changeInitiatorId: initiatorId,
            });
            assign(this.settings.bookmarks, settings);
            syncSettings();
            fastSyncSettings();
        });
        this.bus.on('system/syncSettings/backgrounds', (settings, { initiatorId }) => {
            eventToApp('system/syncSettings/backgrounds', {
                settings,
                changeInitiatorId: initiatorId,
            });
            assign(this.settings.backgrounds, settings);
            syncSettings();
            fastSyncSettings();
        });

        this.bus.on('system/getSettings/app', (settings, props, callback) => {
            callback(this.settings.app);
            fastSyncSettings();
        });
        this.bus.on('system/getSettings/bookmarks', (settings, props, callback) => {
            callback(this.settings.bookmarks);
            fastSyncSettings();
        });
        this.bus.on('system/getSettings/backgrounds', (settings, props, callback) => {
            callback(this.settings.backgrounds);
            fastSyncSettings();
        });
    }

    fastSync() {
        console.log('Save fast cache settings', this.settings);
        localStorage.setItem('settings', JSON.stringify(this.settings));
        localStorage.setItem('theme', this.settings.app.theme || defaultSettings.app.theme);
    }

    sync() {
        console.log('Save settings', this.settings);

        FSConnector.saveFile(
            '/settings.json',
            new Blob([JSON.stringify(this.settings)], { type: 'application/json' }),
        ).then(() => {
            console.log('Success save cache settings');
        });
    }
}

export default SyncSettings;
