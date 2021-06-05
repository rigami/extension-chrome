import { makeAutoObservable, reaction, toJS } from 'mobx';
import { WidgetsSettings } from '@/stores/universal/settings';
import { FETCH } from '@/enum';
import { eventToBackground } from '@/stores/server/bus';
import { captureException } from '@sentry/react';
import awaitInstallStorage from '@/utils/awaitInstallStorage';

class WidgetsService {
    _coreService;
    settings;
    weather;
    showWeather = false;

    constructor(coreService) {
        makeAutoObservable(this);
        this._coreService = coreService;
        this.settings = new WidgetsSettings();

        this.subscribe();
    }

    async autoDetectWeatherLocation() {
        const { state } = await navigator.permissions.query({ name: 'geolocation' });

        if (state !== 'granted') {
            return this._getPermissionsToGeolocation();
        }

        const position = await this.getCurrentPosition();

        return new Promise((resolve, reject) => eventToBackground(
            'widgets/connectors/setLocationGeolocation',
            position,
            (success) => (success ? resolve() : reject()),
        ));
    }

    async searchWeatherLocation(query) {
        return new Promise((resolve, reject) => eventToBackground(
            'widgets/connectors/searchLocation',
            query,
            ({ success, result }) => (success ? resolve(result) : reject()),
        ));
    }

    setWeatherLocation(location) {
        eventToBackground('widgets/connectors/setLocationManual', location);
    }

    async getCurrentPosition() {
        console.log('[weather] Update current position...');

        const options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        };

        const position = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(
            resolve,
            reject,
            options,
        ));

        console.log('[weather] Current position:', position);

        return {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        };
    }

    async _getPermissionsToGeolocation() {
        console.log('[weather] Get permissions to weather...');
        const { state } = await navigator.permissions.query({ name: 'geolocation' });

        console.log('[weather] Permissions to weather is', state);

        if (state === 'denied') {
            return Promise.reject(new Error('Denied'));
        }

        try {
            if (!navigator.geolocation) {
                return Promise.reject(new Error('Not supported'));
            }

            return Promise.resolve();
        } catch (e) {
            captureException(e);
            return Promise.reject(e);
        }
    }

    async subscribe() {
        await awaitInstallStorage(this.settings);

        reaction(
            () => this._coreService.storage.persistent.data.weather,
            () => {
                this.weather = this._coreService.storage.persistent.data.weather;
                console.log('[weather] Change weather:', toJS(this.weather));
            },
        );

        reaction(
            () => [this.settings.dtwUseWeather, this.weather?.status, this.weather?.lastUpdateStatus],
            () => {
                this.showWeather = this.settings.dtwUseWeather
                    && (this.weather?.status === FETCH.ONLINE || this.weather?.status === FETCH.PENDING)
                    && this.weather?.lastUpdateStatus === FETCH.DONE;
            },
        );

        if (this.settings.dtwUseWeather) this.weather = this._coreService.storage.persistent.data.weather;

        this.showWeather = this.settings.dtwUseWeather
            && (this.weather?.status === FETCH.ONLINE || this.weather?.status === FETCH.PENDING)
            && this.weather?.lastUpdateStatus === FETCH.DONE;

        this._coreService.globalBus.on('widgets/connectors/getCurrentWeather', ({ callback }) => {
            this.autoDetectWeatherLocation().then(callback).catch(callback);
        });
    }
}

export default WidgetsService;
