import { action, makeAutoObservable } from 'mobx';
import defaultSettings from '@/config/settings';
import { assign, pick, size } from 'lodash';
import BusApp, { eventToBackground, instanceId } from '@/stores/server/bus';
import { captureException } from '@sentry/react';

class BackgroundSettingsStore {
    selectionMethod;
    type;
    changeInterval;
    dimmingPower;
    isSync = false;

    constructor() {
        makeAutoObservable(this);

        try {
            this.update(JSON.parse(localStorage.getItem('settings')).backgrounds, false);
            this.isSync = true;
        } catch (e) {
            console.warn('Failed get backgrounds settings from cache. Request form background...');
            captureException(e);
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

        if (sync && size(updProps) !== 0) eventToBackground('system/syncSettings', { backgrounds: updProps });
    }
}

class WidgetsSettingsStore {
    useWidgets;
    dtwPosition;
    dtwSize;
    dtwUseTime;
    dtwTimeFormat12;
    dtwUseDate;
    dtwDateAction;
    dtwUseWeather;
    dtwWeatherMetrics;
    dtwWeatherAction;
    isSync = false;

    constructor() {
        makeAutoObservable(this);
        this.useWidgets = defaultSettings.widgets.useWidgets;
        this.dtwPosition = defaultSettings.widgets.dtw.position;
        this.dtwSize = defaultSettings.widgets.dtw.size;
        this.dtwUseTime = defaultSettings.widgets.dtw.time.useTime;
        this.dtwTimeFormat12 = defaultSettings.widgets.dtw.time.format12;
        this.dtwUseDate = defaultSettings.widgets.dtw.date.useDate;
        this.dtwDateAction = defaultSettings.widgets.dtw.date.defaultAction;
        this.dtwUseWeather = defaultSettings.widgets.dtw.weather.useWeather;
        this.dtwWeatherMetrics = defaultSettings.widgets.dtw.weather.metrics;
        this.dtwWeatherAction = defaultSettings.widgets.dtw.weather.defaultAction;

        try {
            this.update(JSON.parse(localStorage.getItem('settings')).widgets, false);
            this.isSync = true;
        } catch (e) {
            console.warn('Failed get widgets settings from cache. Request form background...');
            captureException(e);
            eventToBackground('system/getSettings/widgets', null, (settings) => {
                this.update(settings, false);
                this.isSync = true;
            });
        }

        BusApp().on('system/syncSettings/widgets', ({ settings, changeInitiatorId }) => {
            if (changeInitiatorId !== instanceId) this.update(settings, false);
        });
    }

    @action
    update(props = {}, sync = true) {
        const updProps = pick(props, [
            'useWidgets',
            'dtwPosition',
            'dtwSize',
            'dtwUseTime',
            'dtwTimeFormat12',
            'dtwUseDate',
            'dtwDateAction',
            'dtwUseWeather',
            'dtwWeatherMetrics',
            'dtwWeatherAction',
        ]);

        assign(this, updProps);

        if (sync && size(updProps) !== 0) eventToBackground('system/syncSettings', { widgets: updProps });
    }
}

class BookmarksSettingsStore {
    fapStyle;
    fapPosition;
    fapAlign;
    favorites;
    syncWithSystem;
    isSync = false;

    constructor() {
        makeAutoObservable(this);

        try {
            this.update(JSON.parse(localStorage.getItem('settings')).bookmarks, false);
            this.isSync = true;
        } catch (e) {
            console.warn('Failed get bookmarks settings from cache. Request form background...');
            captureException(e);
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
            'fapAlign',
            'favorites',
            'syncWithSystem',
        ]);

        assign(this, updProps);

        if (sync && size(updProps) !== 0) eventToBackground('system/syncSettings', { bookmarks: updProps });
    }
}

class AppSettingsStore {
    theme;
    tabName;
    defaultActivity;
    backdropTheme;
    lastUsageVersion;
    isSync = false;

    constructor() {
        makeAutoObservable(this);
        this.lastUsageVersion = null;

        try {
            this.update(JSON.parse(localStorage.getItem('settings')).app, false);
            this.isSync = true;
        } catch (e) {
            console.warn('Failed get app settings from cache. Request form background...');
            captureException(e);
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
            'backdropTheme',
            'lastUsageVersion',
            'defaultActivity',
        ]);

        assign(this, updProps);

        if (sync && size(updProps) !== 0) eventToBackground('system/syncSettings', { app: updProps });
    }
}

export {
    AppSettingsStore,
    BookmarksSettingsStore,
    BackgroundSettingsStore,
    WidgetsSettingsStore,
};
