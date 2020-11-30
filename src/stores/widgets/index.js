import { makeAutoObservable, reaction } from 'mobx';
import { WidgetsSettingsStore } from '@/stores/app/settings';

class WidgetsService {
    _coreService;
    settings;
    weather;

    constructor(coreService) {
        makeAutoObservable(this);
        this._coreService = coreService;
        this.settings = new WidgetsSettingsStore();

        reaction(
            () => this._coreService.storage.persistent.widgetWeather,
            () => { this.weather = this._coreService.storage.persistent.widgetWeather; },
        );

        if (this.settings.dtwUseWeather) this.weather = this._coreService.storage.persistent.widgetWeather;
    }

    async getPermissionsToWeather() {
        if (!navigator.geolocation) {
            throw new Error('not supported');
        }

        await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));
    }
}

export default WidgetsService;
