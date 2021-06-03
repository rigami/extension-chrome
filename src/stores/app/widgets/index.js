import { makeAutoObservable, reaction } from 'mobx';
import { WidgetsSettings } from '@/stores/universal/settings';
import { FETCH } from '@/enum';
import { eventToBackground, eventToRequestPermissions } from '@/stores/server/bus';
import appVariables from '@/config/appVariables';

class WidgetsService {
    _coreService;
    settings;
    weather;
    showWeather = false;

    constructor(coreService) {
        makeAutoObservable(this);
        this._coreService = coreService;
        this.settings = new WidgetsSettings();

        reaction(
            () => this._coreService.storage.persistent.data.weather,
            () => { this.weather = this._coreService.storage.persistent.data.weather; },
        );

        if (this.settings.dtwUseWeather) this.weather = this._coreService.storage.persistent.data.weather;

        reaction(
            () => [this.settings.dtwUseWeather, this.weather?.status, this.weather?.lastUpdateStatus],
            () => {
                this.showWeather = this.settings.dtwUseWeather
                    && (this.weather?.status === FETCH.ONLINE || this.weather?.status === FETCH.PENDING)
                    && this.weather?.lastUpdateStatus === FETCH.DONE;
            },
        );

        this.showWeather = this.settings.dtwUseWeather
            && (this.weather?.status === FETCH.ONLINE || this.weather?.status === FETCH.PENDING)
            && this.weather?.lastUpdateStatus === FETCH.DONE;
    }

    async autoDetectWeatherLocation() {
        return new Promise((resolve, reject) => eventToBackground(
            'widgets/connectors/autoDetectLocation',
            {},
            (success) => (success ? resolve() : reject()),
        ));
    }

    async searchWeatherLocation(query) {
        return new Promise((resolve, reject) => eventToBackground(
            'widgets/connectors/searchLocation',
            { query },
            ({ success, result }) => (success ? resolve(result) : reject()),
        ));
    }

    setWeatherLocation(location) {
        eventToBackground('widgets/connectors/setLocation', { location });
    }

    async getPermissionsToWeather() {
        const { state } = await navigator.permissions.query({ name: 'geolocation' });

        if (state === 'granted') return Promise.resolve();
        if (state === 'denied') return Promise.reject();

        const iframe = document.createElement('iframe');
        iframe.className = 'hidden-iframe';
        iframe.src = `chrome-extension://${appVariables.extensionId}/requestPermissions.html`;

        document.body.appendChild(iframe);

        return new Promise((resolve, reject) => {
            const listener = this._coreService.globalEventBus.on('requestPermissions/ready', () => {
                eventToRequestPermissions('requestPermissions/geolocation', {}, (result) => {
                    console.log('requestPermissions/geolocation', result);
                    iframe.remove();
                    if (result) resolve(); else reject();
                });
                this._coreService.globalEventBus.removeListener(listener);
            });
        });
    }
}

export default WidgetsService;
