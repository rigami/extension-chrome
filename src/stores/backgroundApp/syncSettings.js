import BusApp, { eventToApp } from '@/stores/backgroundApp/busApp';
import { assign, throttle } from 'lodash';
import defaultSettings from '@/config/settings';
import FSConnector from '@/utils/fsConnector';
import { makeAutoObservable } from 'mobx';

class SyncSettings {
    bus;
    settings;

    constructor() {
        makeAutoObservable(this);
        this.bus = BusApp();
        this.settings = {
            app: {},
            bookmarks: {},
            backgrounds: {},
            widgets: {},
        };
        const changed = {
            backgrounds: false,
            bookmarks: false,
            settings: false,
            widgets: false,
        };
        const fastSyncSettings = throttle((initiatorId) => {
            this.fastSync(changed, initiatorId);
            changed.backgrounds = false;
            changed.bookmarks = false;
            changed.settings = false;
            changed.widgets = false;
        }, 1000);
        const syncSettings = throttle(() => this.sync(), 10000);

        try {
            console.log('Getting settings from fast cache');
            this.settings = {
                ...this.settings,
                ...JSON.parse(localStorage.getItem('settings')),
            };

            fastSyncSettings();
        } catch (e) {
            console.log('Not find fast cache or broken. Get from old cache');

            FSConnector.getFileAsText('/settings.json')
                .then((props) => {
                    this.settings = {
                        app: {},
                        bookmarks: {},
                        backgrounds: {},
                        widgets: {},
                        ...JSON.parse(props),
                    };
                    fastSyncSettings();
                })
                .catch(console.error);
        }

        this.bus.on('system/syncSettings/app', (settings, { initiatorId }) => {
            assign(this.settings.app, settings);
            changed.settings = true;
            syncSettings();
            fastSyncSettings(initiatorId);
        });
        this.bus.on('system/syncSettings/bookmarks', (settings, { initiatorId }) => {
            assign(this.settings.bookmarks, settings);
            changed.bookmarks = true;
            syncSettings();
            fastSyncSettings(initiatorId);
        });
        this.bus.on('system/syncSettings/backgrounds', (settings, { initiatorId }) => {
            assign(this.settings.backgrounds, settings);
            changed.backgrounds = true;
            syncSettings();
            fastSyncSettings(initiatorId);
        });
        this.bus.on('system/syncSettings/widgets', (settings, { initiatorId }) => {
            assign(this.settings.widgets, settings);
            changed.widgets = true;
            syncSettings();
            fastSyncSettings(initiatorId);
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
        this.bus.on('system/getSettings/widgets', (settings, props, callback) => {
            callback(this.settings.widgets);
            fastSyncSettings();
        });
    }

    fastSync({ backgrounds = false, settings = false, bookmarks = false, widgets = false }, initiatorId) {
        console.log('Save fast cache settings', this, this.settings);
        localStorage.setItem('settings', JSON.stringify(this.settings));
        localStorage.setItem('theme', this.settings.app?.theme || defaultSettings.app.theme);

        if (settings) {
            eventToApp('system/syncSettings/app', {
                settings: this.settings.app || {},
                changeInitiatorId: initiatorId,
            });
        }
        if (bookmarks) {
            eventToApp('system/syncSettings/bookmarks', {
                settings: this.settings.bookmarks || {},
                changeInitiatorId: initiatorId,
            });
        }
        if (backgrounds) {
            eventToApp('system/syncSettings/backgrounds', {
                settings: this.settings.backgrounds || {},
                changeInitiatorId: initiatorId,
            });
        }
        if (widgets) {
            eventToApp('system/syncSettings/widgets', {
                settings: this.settings.widgets || {},
                changeInitiatorId: initiatorId,
            });
        }
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

    restore(settings) {
        this.settings = {
            app: {},
            bookmarks: {},
            backgrounds: {},
            widgets: {},
            ...settings,
        };
        this.fastSync({
            backgrounds: true,
            bookmarks: true,
            settings: true,
            widgets: true,
        });
        this.sync();
    }
}

export default SyncSettings;
