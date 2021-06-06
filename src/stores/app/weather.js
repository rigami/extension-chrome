import { makeAutoObservable, reaction, toJS } from 'mobx';
import { WidgetsSettings } from '@/stores/universal/settings';
import { FETCH } from '@/enum';
import { eventToBackground } from '@/stores/server/bus';
import { captureException } from '@sentry/react';
import awaitInstallStorage from '@/utils/awaitInstallStorage';
import OpenWeatherMap from '@/stores/universal/weather/connectors/OpenWeatherMap';
import WeatherLocation from '@/entities/WeatherLocation';
import { first } from 'lodash';
import { instanceOf } from 'prop-types';

class WeatherService {
    _coreService;
    settings;
    weather;
    showWeather = false;
    connector;

    constructor(coreService) {
        makeAutoObservable(this);
        this._coreService = coreService;
        this.settings = new WidgetsSettings();
        this.connector = new OpenWeatherMap();

        this.subscribe();
    }

    async autoDetectLocation() {
        const { state } = await navigator.permissions.query({ name: 'geolocation' });

        if (state !== 'granted') {
            return this._getPermissionsToGeolocation();
        }

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

        const results = this.connector.searchLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
        });

        console.log('results:', results);

        return new WeatherLocation({
            ...first(results).location,
            manual: false,
        });
    }

    async searchLocation(query) {
        const results = this.connector.searchLocation({ query });

        return results.map((result) => ({
            ...result,
            location: new WeatherLocation({
                ...result.location,
                manual: true,
            }),
        }));
    }

    setLocation(location) {
        if (instanceOf(location) !== WeatherLocation) throw new Error('`location` must be `WeatherLocation` instance');

        eventToBackground('weather/forceUpdate', location);
    }

    async autoDetectLocationAndUpdateWeather() {
        const location = await this.autoDetectLocation();

        this.setLocation(location);
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

        this._coreService.globalBus.on('weather/getCurrentLocation', ({ callback }) => {
            this.autoDetectLocation().then(callback).catch(callback);
        });
    }
}

export default WeatherService;
