import { computed, makeObservable, override } from 'mobx';
import { mapKeys, pick } from 'lodash';
import PersistentStorage from '../storage/persistent';
import defaultSettings from '@/config/settings';

class WidgetsSettings extends PersistentStorage {
    constructor(upgrade) {
        super('settings', ((currState) => ({
            'widgets.useDate': defaultSettings.widgets.useDate,
            'widgets.dateAction': defaultSettings.widgets.dateDefaultAction,
            'widgets.useTime': defaultSettings.widgets.useTime,
            'widgets.timeFormat12': defaultSettings.widgets.timeFormat12,
            'widgets.useWeather': defaultSettings.widgets.useWeather,
            'widgets.weatherMetrics': defaultSettings.widgets.weatherMetrics,
            'widgets.weatherAction': defaultSettings.widgets.weatherDefaultAction,
            ...(currState || {}),
        })));
        makeObservable(this);
    }

    @computed
    get useDate() { return this.data['widgets.useDate']; }

    @computed
    get dateAction() { return this.data['widgets.dateAction']; }

    @computed
    get useTime() { return this.data['widgets.useTime']; }

    @computed
    get timeFormat12() { return this.data['widgets.timeFormat12']; }

    @computed
    get useWeather() { return this.data['widgets.useWeather']; }

    @computed
    get weatherMetrics() { return this.data['widgets.weatherMetrics']; }

    @computed
    get weatherAction() { return this.data['widgets.weatherAction']; }

    @override
    update(props = {}) {
        const updProps = pick(props, [
            'useDate',
            'dateAction',
            'useTime',
            'timeFormat12',
            'useWeather',
            'weatherMetrics',
            'weatherAction',
        ]);

        super.update(mapKeys(updProps, (value, key) => `widgets.${key}`));
    }
}

export default WidgetsSettings;
