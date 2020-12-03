import { makeAutoObservable, reaction } from 'mobx';
import fetchData from '@/utils/xhrPromise'
import appVariables from '@/config/appVariables';
import BusApp, { eventToApp } from '@/stores/backgroundApp/busApp';
import { FETCH } from '@/enum';

class WidgetsService {
    bus;
    settings;
    weather;
    storageService;
    _lastUpd;
    _timer;
    _active;

    constructor(storageService, settingsService) {
        makeAutoObservable(this);
        this.bus = BusApp();
        this.storageService = storageService;
        this.settings = settingsService.settings;

        const updateWeather = () => {
            if (!this._active) return;
            console.log('Weather update');
            this._lastUpd = Date.now();
            this.storageService.updatePersistent({
                widgetWeather: {
                    ...this.storageService.storage.widgetWeather,
                    status: FETCH.PENDING,
                },
            });
            this.getCurWeather()
                .then(() => {
                    this.storageService.updatePersistent({
                        widgetWeather: {
                            ...this.storageService.storage.widgetWeather,
                            status: FETCH.ONLINE,
                        },
                    });
                })
                .catch((e) => {
                    console.error(e);
                    this.storageService.updatePersistent({
                        widgetWeather: {
                            ...this.storageService.storage.widgetWeather,
                            status: FETCH.FAILED,
                            lastUpdateStatus: FETCH.FAILED,
                        },
                    });
                })
                .finally(() => {
                    eventToApp('system/ping', 'weather-check', (pong) => {
                        let time = appVariables.widgets.weather.updateTime.inactive;

                        if (pong && pong.type === 'weather-check') {
                            time = appVariables.widgets.weather.updateTime.active;
                        }

                        this._lastUpd = Date.now();
                        this._timer = setTimeout(updateWeather, time);
                        console.log(`Weather await ${time}ms`);
                    });
                });
        }

        const start = () => {
            clearTimeout(this._timer);
            this._active = true;

            if (
                this.weather?.lastUpdateStatus === FETCH.FAILED
                || !this._lastUpd
                || this._lastUpd + appVariables.widgets.weather.updateTime.inactive <= Date.now()
                || !isFinite(this.weather?.currTemp)
            ) {
                console.log('Weather start')
                updateWeather();
            } else {
                console.log(`Weather await ${this._lastUpd + appVariables.widgets.weather.updateTime.inactive - Date.now()}ms`);
                this._timer = setTimeout(start, this._lastUpd + appVariables.widgets.weather.updateTime.inactive - Date.now());
                this.storageService.updatePersistent({
                    widgetWeather: {
                        ...this.storageService.storage.widgetWeather,
                        status: FETCH.ONLINE,
                    },
                });
            }
        };

        const stop = () => {
            console.log('Weather stop');
            this._active = false;
            clearTimeout(this._timer);

            this.storageService.updatePersistent({
                widgetWeather: {
                    ...this.storageService.storage.widgetWeather,
                    status: FETCH.STOP,
                },
            });
        };

        this._lastUpd = this.storageService.storage.widgetWeather?.lastUpdateTimestamp;

        reaction(
            () => this.settings.widgets.dtwUseWeather,
            () => {
                if (this.settings.widgets.dtwUseWeather) start();
                else stop();
            },
        );

        if (this.settings.widgets.dtwUseWeather) start();

        this.bus.on('widgets/weather/update', () => {
            console.log('Weather request force update');
            if (this._lastUpd + appVariables.widgets.weather.updateTime.active < Date.now()) {
                console.log('Weather force update');
                updateWeather();
            } else {
                console.log(`Weather update less ${appVariables.widgets.weather.updateTime.active}ms ago`);
                clearTimeout(this._timer);
                console.log(`Weather await ${this._lastUpd + appVariables.widgets.weather.updateTime.active - Date.now()}ms`);
                this._timer = setTimeout(updateWeather, this._lastUpd + appVariables.widgets.weather.updateTime.active - Date.now());
            }
        });
    }

    async getCurWeather() {
        if (!navigator.geolocation) {
            console.log('Geolocation is not supported for this Browser/OS version yet.');
            throw new Error('Geolocation is not supported');
        }

        console.log('Geolocation is supported!');

        let currPos;

        currPos = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));

        const coords = { latitude: currPos.coords.latitude, longitude: currPos.coords.longitude };

        console.log('currPos', currPos, coords)

        const openweathermap = appVariables.widgets.weather.services.openweathermap;

        const { response: weather } = await fetchData(openweathermap.api.curr({
            lat: coords.latitude,
            lon: coords.longitude,
            apiKey: openweathermap.apiKey,
            lang: 'ru',
        }));

        console.log('weather', weather)

        this.weather = {
            ...this.weather,
            currTemp: weather.main.temp,
            regionName: weather.name,
            ...coords,
            lastUpdateStatus: FETCH.DONE,
            lastUpdateTimestamp: Date.now(),
            status: FETCH.ONLINE,
        };

        this.storageService.updatePersistent({
            widgetWeather: this.weather,
        });
    }
}

export default WidgetsService;
