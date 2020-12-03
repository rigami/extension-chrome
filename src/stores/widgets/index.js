import { makeAutoObservable, reaction } from 'mobx';
import { WidgetsSettingsStore } from '@/stores/app/settings';
import { FETCH } from '@/enum';

class WidgetsService {
    _coreService;
    settings;
    weather;
    showWeather;

    constructor(coreService) {
        makeAutoObservable(this);
        this._coreService = coreService;
        this.settings = new WidgetsSettingsStore();

        reaction(
            () => this._coreService.storage.persistent.widgetWeather,
            () => { this.weather = this._coreService.storage.persistent.widgetWeather; },
        );

        if (this.settings.dtwUseWeather) this.weather = this._coreService.storage.persistent.widgetWeather;


        reaction(
            () => [
                this.settings.dtwUseWeather,
                this.weather?.status,
                this.weather?.lastUpdateStatus
            ],
            () => {
                console.log("CHANGE WW")
                this.showWeather = this.settings.dtwUseWeather
                    && (this.weather?.status === FETCH.ONLINE || this.weather?.status === FETCH.PENDING)
                    && this.weather?.lastUpdateStatus === FETCH.DONE
            },
        );
    }

    async getPermissionsToWeather() {
        if (!navigator.geolocation) {
            throw new Error('not supported');
        }

        await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));
    }
}

export default WidgetsService;
