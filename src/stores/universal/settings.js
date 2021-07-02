import { computed, makeObservable, override } from 'mobx';
import defaultSettings from '@/config/settings';
import { pick } from 'lodash';
import { PersistentStorage } from '@/stores/universal/storage';

class BackgroundsSettings extends PersistentStorage {
    constructor(upgrade) {
        super('backgrounds', upgrade && ((currState) => ({
            selectionMethod: defaultSettings.backgrounds.selectionMethod,
            type: defaultSettings.backgrounds.type,
            changeInterval: defaultSettings.backgrounds.changeInterval,
            dimmingPower: defaultSettings.backgrounds.dimmingPower,
            ...(currState || {}),
        })));
        makeObservable(this, {
            selectionMethod: computed,
            type: computed,
            changeInterval: computed,
            dimmingPower: computed,
            update: override,
        });
    }

    @computed
    get selectionMethod() { return this.data.selectionMethod; }

    @computed
    get type() { return this.data.type; }

    @computed
    get changeInterval() { return this.data.changeInterval; }

    @computed
    get dimmingPower() { return this.data.dimmingPower; }

    @override
    update(props = {}) {
        const updProps = pick(props, [
            'selectionMethod',
            'type',
            'changeInterval',
            'dimmingPower',
        ]);
        console.log('update', this.namespace, updProps);

        super.update(updProps);
    }
}

class WidgetsSettings extends PersistentStorage {
    constructor(upgrade) {
        super('widgets', upgrade && ((currState) => ({
            useWidgets: defaultSettings.widgets.useWidgets,
            dtwPosition: defaultSettings.widgets.dtw.position,
            dtwSize: defaultSettings.widgets.dtw.size,
            dtwUseTime: defaultSettings.widgets.dtw.time.useTime,
            dtwTimeFormat12: defaultSettings.widgets.dtw.time.format12,
            dtwUseDate: defaultSettings.widgets.dtw.date.useDate,
            dtwDateAction: defaultSettings.widgets.dtw.date.defaultAction,
            dtwUseWeather: defaultSettings.widgets.dtw.weather.useWeather,
            dtwWeatherMetrics: defaultSettings.widgets.dtw.weather.metrics,
            dtwWeatherAction: defaultSettings.widgets.dtw.weather.defaultAction,
            ...(currState || {}),
        })));
        makeObservable(this, {
            useWidgets: computed,
            dtwPosition: computed,
            dtwSize: computed,
            dtwUseTime: computed,
            dtwTimeFormat12: computed,
            dtwUseDate: computed,
            dtwDateAction: computed,
            dtwUseWeather: computed,
            dtwWeatherMetrics: computed,
            dtwWeatherAction: computed,
            update: override,
        });
    }

    @computed
    get useWidgets() { return this.data.useWidgets; }

    @computed
    get dtwPosition() { return this.data.dtwPosition; }

    @computed
    get dtwSize() { return this.data.dtwSize; }

    @computed
    get dtwUseTime() { return this.data.dtwUseTime; }

    @computed
    get dtwTimeFormat12() { return this.data.dtwTimeFormat12; }

    @computed
    get dtwUseDate() { return this.data.dtwUseDate; }

    @computed
    get dtwDateAction() { return this.data.dtwDateAction; }

    @computed
    get dtwUseWeather() { return this.data.dtwUseWeather; }

    @computed
    get dtwWeatherMetrics() { return this.data.dtwWeatherMetrics; }

    @computed
    get dtwWeatherAction() { return this.data.dtwWeatherAction; }

    @override
    update(props = {}) {
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

        super.update(updProps);
    }
}

class BookmarksSettings extends PersistentStorage {
    constructor(upgrade) {
        super('bookmarks', upgrade && ((currState) => ({
            fapStyle: defaultSettings.bookmarks.fapStyle,
            fapPosition: defaultSettings.bookmarks.fapPosition,
            fapAlign: defaultSettings.bookmarks.fapAlign,
            favorites: defaultSettings.bookmarks.favorites,
            syncWithSystem: defaultSettings.bookmarks.syncWithSystem,
            ...(currState || {}),
        })));
        makeObservable(this, {
            fapStyle: computed,
            fapPosition: computed,
            fapAlign: computed,
            favorites: computed,
            syncWithSystem: computed,
            update: override,
        });
    }

    @computed
    get fapStyle() { return this.data.fapStyle; }

    @computed
    get fapPosition() { return this.data.fapPosition; }

    @computed
    get fapAlign() { return this.data.fapAlign; }

    @computed
    get favorites() { return this.data.favorites; }

    @computed
    get syncWithSystem() { return this.data.syncWithSystem; }

    @override
    update(props = {}) {
        const updProps = pick(props, [
            'fapStyle',
            'fapPosition',
            'fapAlign',
            'favorites',
            'syncWithSystem',
        ]);

        super.update(updProps);
    }
}

class AppSettings extends PersistentStorage {
    constructor(upgrade) {
        super('app', upgrade && ((currState) => ({
            theme: defaultSettings.app.theme,
            tabName: defaultSettings.app.tabName,
            defaultActivity: defaultSettings.app.defaultActivity,
            backdropTheme: defaultSettings.app.backdropTheme,
            lastUsageVersion: null,
            ...(currState || {}),
        })));
        makeObservable(this, {
            theme: computed,
            tabName: computed,
            defaultActivity: computed,
            backdropTheme: computed,
            lastUsageVersion: computed,
            update: override,
        });
    }

    @computed
    get theme() { return this.data.theme; }

    @computed
    get tabName() { return this.data.tabName; }

    @computed
    get defaultActivity() { return this.data.defaultActivity; }

    @computed
    get backdropTheme() { return this.data.backdropTheme; }

    @computed
    get lastUsageVersion() { return this.data.lastUsageVersion; }

    @override
    update(props = {}) {
        const updProps = pick(props, [
            'theme',
            'tabName',
            'backdropTheme',
            'lastUsageVersion',
            'defaultActivity',
        ]);

        super.update(updProps);

        if ('localStorage' in self) {
            localStorage.setItem('theme', this.theme || defaultSettings.app.theme);
            localStorage.setItem('backdropTheme', this.backdropTheme || defaultSettings.app.backdropTheme);
            localStorage.setItem('appTabName', this.tabName || defaultSettings.app.tabName);
        }
    }
}

export {
    AppSettings,
    BookmarksSettings,
    BackgroundsSettings,
    WidgetsSettings,
};
