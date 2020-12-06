import { makeAutoObservable, reaction } from 'mobx';
import { WidgetsSettingsStore } from '@/stores/app/settings';
import { FETCH } from '@/enum';
import { eventToBackground } from '@/stores/backgroundApp/busApp';

class WidgetsService {
    _coreService;
    settings;
    weather;
    showWeather = false;

    constructor(coreService) {
        makeAutoObservable(this);
        this._coreService = coreService;
        this.settings = new WidgetsSettingsStore();

        reaction(
            () => this._coreService.storage.persistent.weather,
            () => { this.weather = this._coreService.storage.persistent.weather; },
        );

        if (this.settings.dtwUseWeather) this.weather = this._coreService.storage.persistent.weather;

        reaction(
            () => [
                this.settings.dtwUseWeather,
                this.weather?.status,
                this.weather?.lastUpdateStatus
            ],
            () => {
                this.showWeather = this.settings.dtwUseWeather
                    && (this.weather?.status === FETCH.ONLINE || this.weather?.status === FETCH.PENDING)
                    && this.weather?.lastUpdateStatus === FETCH.DONE
            },
        );

        this.showWeather = this.showWeather = this.settings.dtwUseWeather
            && (this.weather?.status === FETCH.ONLINE || this.weather?.status === FETCH.PENDING)
            && this.weather?.lastUpdateStatus === FETCH.DONE
    }

    async autoDetectWeatherLocation() {
        return new Promise((resolve, reject) => eventToBackground(
            'widgets/weather/autoDetectLocation',
            {},
            (success) => success ? resolve() : reject(),
        ));
    }

    async searchWeatherLocation(query) {
        return new Promise((resolve) => eventToBackground(
            'widgets/weather/searchLocation',
            { query },
            resolve,
        ));
    }

    setWeatherLocation(location) {
        eventToBackground('widgets/weather/setLocation',{ location });

    }

    async getPermissionsToWeather() {
        if (!navigator.geolocation) {
            throw new Error('not supported');
        }

        await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));
    }
}

export default WidgetsService;
