import { computed, makeObservable, override } from 'mobx';
import { pick } from 'lodash';
import PersistentStorage from '../storage/persistent';
import defaultSettings from '@/config/settings';

class WidgetsSettings extends PersistentStorage {
    constructor(upgrade) {
        super('widgets', upgrade && ((currState) => ({
            useDate: defaultSettings.widgets.useDate,
            dateAction: defaultSettings.widgets.dateDefaultAction,
            useTime: defaultSettings.widgets.useTime,
            timeFormat12: defaultSettings.widgets.timeFormat12,
            useWeather: defaultSettings.widgets.useWeather,
            weatherMetrics: defaultSettings.widgets.weatherMetrics,
            weatherAction: defaultSettings.widgets.weatherDefaultAction,
            ...(currState || {}),
        })));
        makeObservable(this);
    }

    @computed
    get useDate() { return this.data.useDate; }

    @computed
    get dateAction() { return this.data.dateAction; }

    @computed
    get useTime() { return this.data.useTime; }

    @computed
    get timeFormat12() { return this.data.timeFormat12; }

    @computed
    get useWeather() { return this.data.useWeather; }

    @computed
    get weatherMetrics() { return this.data.weatherMetrics; }

    @computed
    get weatherAction() { return this.data.weatherAction; }

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

        super.update(updProps);
    }
}

export default WidgetsSettings;
