import {
    action, computed, makeObservable, override,
} from 'mobx';
import { pick } from 'lodash';
import defaultSettings from '@/config/settings';
import settingsStorage from '@/stores/universal/settings/rootSettings';

export const migration = (currState) => ({
    'widgets.useDate': currState['widgets.useDate'] || defaultSettings.widgets.useDate,
    'widgets.dateAction': currState['widgets.dateAction'] || defaultSettings.widgets.dateDefaultAction,
    'widgets.useTime': currState['widgets.useTime'] || defaultSettings.widgets.useTime,
    'widgets.timeFormat12': currState['widgets.timeFormat12'] || defaultSettings.widgets.timeFormat12,
    'widgets.useWeather': currState['widgets.useWeather'] || defaultSettings.widgets.useWeather,
    'widgets.weatherMetrics': currState['widgets.weatherMetrics'] || defaultSettings.widgets.weatherMetrics,
    'widgets.weatherAction': currState['widgets.weatherAction'] || defaultSettings.widgets.weatherDefaultAction,
});

class WidgetsSettings {
    constructor() {
        makeObservable(this);

        this._storage = settingsStorage;
    }

    @computed
    get useDate() { return this._storage.data['widgets.useDate']; }

    @computed
    get dateAction() { return this._storage.data['widgets.dateAction']; }

    @computed
    get useTime() { return this._storage.data['widgets.useTime']; }

    @computed
    get timeFormat12() { return this._storage.data['widgets.timeFormat12']; }

    @computed
    get useWeather() { return this._storage.data['widgets.useWeather']; }

    @computed
    get weatherMetrics() { return this._storage.data['widgets.weatherMetrics']; }

    @computed
    get weatherAction() { return this._storage.data['widgets.weatherAction']; }

    @action
    recalc() {}

    @action
    update(props = {}, force = false) {
        const updProps = pick(props, [
            'useDate',
            'dateAction',
            'useTime',
            'timeFormat12',
            'useWeather',
            'weatherMetrics',
            'weatherAction',
        ]);

        this._storage.update('widgets', updProps, force);
    }
}

export default WidgetsSettings;
