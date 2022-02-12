import { makeAutoObservable, reaction, toJS } from 'mobx';
import { captureException } from '@sentry/react';
import { first } from 'lodash';
import WidgetsSettings from '@/stores/universal/settings/widgets';
import { FETCH } from '@/enum';
import { eventToBackground } from '@/stores/universal/serviceBus';
import awaitInstallStorage from '@/utils/helpers/awaitInstallStorage';
import OpenWeatherMap from '@/stores/universal/weather/connectors/OpenWeatherMap';
import WeatherLocation from '@/entities/WeatherLocation';
import settingsStorage from '@/stores/universal/settings/rootSettings';
import Weather from '@/entities/Weather';

class WeatherService {
    _coreService;
    settings;
    storage;
    weather;
    showWeather = false;
    connector;

    constructor(coreService) {
        makeAutoObservable(this);
        this._coreService = coreService;
        this.settings = new WidgetsSettings();
        this.connector = new OpenWeatherMap();
        this.storage = this._coreService.storage;

        this.subscribe();
    }

    async autoDetectLocation() {
        const { state } = await navigator.permissions.query({ name: 'geolocation' });

        if (state !== 'granted') {
            await this._getPermissionsToGeolocation();
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

        const results = await this.connector.searchLocation({
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
        const results = await this.connector.searchLocation({ query });

        return results.map((result) => ({
            ...result,
            location: new WeatherLocation({
                ...result.location,
                manual: true,
            }),
        }));
    }

    setLocation(location) {
        if (!(location instanceof WeatherLocation)) throw new Error('`location` must be `WeatherLocation` instance');

        eventToBackground('weather/forceUpdate', location);
    }

    async autoDetectLocationAndUpdateWeather() {
        try {
            const location = await this.autoDetectLocation();

            console.log('autoDetectLocationAndUpdateWeather:', location);

            this.setLocation(location);
        } catch (e) {
            this.storage.update({
                location: null,
                weather: new Weather({
                    ...this.storage.data.weather,
                    status: FETCH.FAILED,
                    lastUpdateStatus: FETCH.FAILED,
                }),
            });

            throw e;
        }
    }

    async _getPermissionsToGeolocation() {
        console.log('[weather] Get permissions to weather...');
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });

        console.log('[weather] Permissions to weather is', permissionStatus.state);

        if (permissionStatus.state === 'granted') {
            console.log('[weather] Permission to geolocation done. Continue...');

            return Promise.resolve();
        }

        if (permissionStatus.state === 'prompt') {
            return new Promise((resolve, reject) => {
                console.log('[weather] Wait answer of request permissions...', permissionStatus.state);

                permissionStatus.onchange = () => {
                    if (permissionStatus.state === 'granted') {
                        console.log('[weather] Permission to geolocation done. Continue...');

                        resolve();
                        return;
                    }

                    reject();
                };

                navigator.geolocation.getCurrentPosition(console.log, reject, {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0,
                });
            });
        }

        console.log('[weather] Denied permissions to geolocation. Abort...');

        return Promise.reject(new Error('Denied'));
    }

    async subscribe() {
        await awaitInstallStorage(settingsStorage);

        reaction(
            () => this.storage.data.weather,
            () => {
                this.weather = this.storage.data.weather;
                console.log('[weather] Change weather:', toJS(this.weather));
            },
        );

        reaction(
            () => [this.settings.useWeather, this.weather?.status, this.weather?.lastUpdateStatus],
            () => {
                this.showWeather = this.settings.useWeather
                    && (this.weather?.status === FETCH.ONLINE || this.weather?.status === FETCH.PENDING)
                    && this.weather?.lastUpdateStatus === FETCH.DONE;
            },
        );

        if (this.settings.useWeather) {
            if (!this.storage.data.location || !this.storage.data.location?.id) {
                console.log('[weather] Location not set. Get current...');
                const location = await this.autoDetectLocation();

                console.log('[weather] Current location:', location);
                this.setLocation(location);
            } else {
                this.weather = this.storage.data.weather;

                this.showWeather = this.settings.useWeather
                    && (this.weather?.status === FETCH.ONLINE || this.weather?.status === FETCH.PENDING)
                    && this.weather?.lastUpdateStatus === FETCH.DONE;
            }
        }

        this._coreService.globalEventBus.on('weather/getCurrentLocation', ({ callback }) => {
            this.autoDetectLocation().then(callback).catch(callback);
        });
    }
}

export default WeatherService;
