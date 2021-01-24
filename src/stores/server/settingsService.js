import { eventToApp } from '@/stores/server/bus';
import { assign, throttle, forEach } from 'lodash';
import FSConnector from '@/utils/fsConnector';
import { makeAutoObservable, toJS } from 'mobx';
import defaultSettings from '@/config/settings';

class SettingsService {
    core;
    settings;

    constructor(core) {
        makeAutoObservable(this);
        this.core = core;
        this.settings = {
            app: defaultSettings.app,
            bookmarks: defaultSettings.bookmarks,
            backgrounds: defaultSettings.backgrounds,
            widgets: {}, // defaultSettings.widgets,
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
            console.log('[settings] Getting settings from fast cache...');
            this.settings = {
                ...this.settings,
                ...JSON.parse(localStorage.getItem('settings')),
            };
            console.log('[settings]', toJS(this.settings))
        } catch (e) {
            console.log('[settings] Not find fast cache or broken. Get from file cache...');

            FSConnector.getFileAsText('/settings.json')
                .then((file) => {
                    const fileSettings = JSON.parse(file);

                    this.settings = {
                        app: {
                            ...defaultSettings.app,
                            ...fileSettings.app,
                        },
                        bookmarks: {
                            ...defaultSettings.bookmarks,
                            ...fileSettings.bookmarks,
                        },
                        backgrounds: {
                            ...defaultSettings.backgrounds,
                            ...fileSettings.backgrounds,
                        },
                        widgets: {
                            // ...defaultSettings.widgets,
                            ...fileSettings.widgets,
                        },
                    };
                    fastSyncSettings();
                })
                .catch((e) => console.error('[settings] Failed read cache from file:', e));
        }

        this.core.globalBus.on('system/syncSettings', (settings, { initiatorId }) => {
            forEach(settings, (value, key) => {
                if (!(key in this.settings)) return;

                assign(this.settings[key], value);
                changed[key] = true;
            });
            syncSettings();
            fastSyncSettings(initiatorId);
        });

        this.core.globalBus.on('system/getSettings/app', (settings, props, callback) => {
            callback(this.settings.app);
            fastSyncSettings();
        });
        this.core.globalBus.on('system/getSettings/bookmarks', (settings, props, callback) => {
            callback(this.settings.bookmarks);
            fastSyncSettings();
        });
        this.core.globalBus.on('system/getSettings/backgrounds', (settings, props, callback) => {
            callback(this.settings.backgrounds);
            fastSyncSettings();
        });
        this.core.globalBus.on('system/getSettings/widgets', (settings, props, callback) => {
            callback(this.settings.widgets);
            fastSyncSettings();
        });
    }

    fastSync({ backgrounds = false, settings = false, bookmarks = false, widgets = false }, initiatorId) {
        console.log('[settings] Save fast cache settings', this, this.settings);
        localStorage.setItem('settings', JSON.stringify(this.settings));
        localStorage.setItem('theme', this.settings.app?.theme || defaultSettings.app.theme);
        localStorage.setItem('backdropTheme', this.settings.app?.backdropTheme || defaultSettings.app.backdropTheme);
        localStorage.setItem('appTabName', this.settings.app?.tabName || defaultSettings.app.tabName);

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
        console.log('[settings] Save settings', this.settings);

        FSConnector.saveFile(
            '/settings.json',
            new Blob([JSON.stringify(this.settings)], { type: 'application/json' }),
        ).then(() => {
            console.log('[settings] Success save cache settings');
        });
    }

    restore(settings) {
        this.settings = {
            app: defaultSettings.app,
            bookmarks: defaultSettings.bookmarks,
            backgrounds: defaultSettings.backgrounds,
            widgets: {}, // defaultSettings.widgets,
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

export default SettingsService;
