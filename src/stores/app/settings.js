import { observable, action } from 'mobx';
import defaultSettings from '@/config/settings';
import { assign, pick, size } from 'lodash';
import BusApp, { eventToBackground, instanceId } from '@/stores/backgroundApp/busApp';

class BackgroundSettingsStore {
    @observable selectionMethod;
    @observable type;
    @observable changeInterval;
    @observable dimmingPower;
    @observable isSync = false;

    constructor() {
        this.selectionMethod = defaultSettings.backgrounds.selection_method;
        this.type = defaultSettings.backgrounds.type;
        this.changeInterval = defaultSettings.backgrounds.change_interval;
        this.dimmingPower = defaultSettings.backgrounds.dimming_power;

        try {
            this.update(JSON.parse(localStorage.getItem('settings')).backgrounds, false);
            this.isSync = true;
        } catch (e) {
            console.warn('Failed get backgrounds settings from cache. Request form background...');
            eventToBackground('system/getSettings/backgrounds', null, (settings) => {
                this.update(settings, false);
                this.isSync = true;
            });
        }

        BusApp().on('system/syncSettings/backgrounds', ({ settings, changeInitiatorId }) => {
            if (changeInitiatorId !== instanceId) this.update(settings, false);
        });
    }

    @action
    update(props = {}, sync = true) {
        const updProps = pick(props, [
            'selectionMethod',
            'type',
            'changeInterval',
            'dimmingPower',
        ]);

        assign(this, updProps);

        if (sync && size(updProps) !== 0) eventToBackground('system/syncSettings/backgrounds', updProps);
    }
}

class BookmarksSettingsStore {
    @observable fapStyle;
    @observable fapPosition;
    @observable openOnStartup;
    @observable favorites;
    @observable syncWithSystem;
    @observable isSync = false;

    constructor() {
        this.fapStyle = defaultSettings.bookmarks.fap_style;
        this.fapPosition = defaultSettings.bookmarks.fap_position;
        this.openOnStartup = defaultSettings.bookmarks.open_on_startup;
        this.favorites = defaultSettings.bookmarks.favorites;
        this.syncWithSystem = defaultSettings.bookmarks.sync_with_system;

        try {
            this.update(JSON.parse(localStorage.getItem('settings')).bookmarks, false);
            this.isSync = true;
        } catch (e) {
            console.warn('Failed get bookmarks settings from cache. Request form background...');
            eventToBackground('system/getSettings/bookmarks', null, (settings) => {
                this.update(settings, false);
                this.isSync = true;
            });
        }

        BusApp().on('system/syncSettings/bookmarks', ({ settings, changeInitiatorId }) => {
            if (changeInitiatorId !== instanceId) this.update(settings, false);
        });
    }

    @action
    update(props = {}, sync = true) {
        const updProps = pick(props, [
            'fapStyle',
            'fapPosition',
            'openOnStartup',
            'favorites',
            'syncWithSystem',
        ]);

        assign(this, updProps);

        if (sync && size(updProps) !== 0) eventToBackground('system/syncSettings/bookmarks', updProps);
    }
}

class AppSettingsStore {
    @observable theme;
    @observable tabName;
    @observable useSystemFont;
    @observable backdropTheme;
    @observable lastUsageVersion;
    @observable isSync = false;

    constructor() {
        this.theme = defaultSettings.app.theme;
        this.tabName = defaultSettings.app.tab_name;
        this.useSystemFont = defaultSettings.app.use_system_font;
        this.backdropTheme = defaultSettings.app.backdrop_theme;
        this.lastUsageVersion = null;

        try {
            this.update(JSON.parse(localStorage.getItem('settings')).app, false);
            this.isSync = true;
        } catch (e) {
            console.warn('Failed get app settings from cache. Request form background...');
            eventToBackground('system/getSettings/app', null, (settings) => {
                this.update(settings, false);
                this.isSync = true;
            });
        }

        BusApp().on('system/syncSettings/app', ({ settings, changeInitiatorId }) => {
            if (changeInitiatorId !== instanceId) this.update(settings, false);
        });
    }

    @action
    update(props = {}, sync = true) {
        const updProps = pick(props, [
            'theme',
            'tabName',
            'useSystemFont',
            'backdropTheme',
            'lastUsageVersion',
        ]);

        assign(this, updProps);

        if (sync && size(updProps) !== 0) eventToBackground('system/syncSettings/app', updProps);
    }
}

export { AppSettingsStore, BookmarksSettingsStore, BackgroundSettingsStore };
