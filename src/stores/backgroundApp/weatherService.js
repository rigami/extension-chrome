import { makeAutoObservable, reaction } from 'mobx';
import fetchData from '@/utils/xhrPromise'
import appVariables from '@/config/appVariables';
import BusApp, { eventToApp } from '@/stores/backgroundApp/busApp';
import { FETCH } from '@/enum';
import OpenWeatherMap from '@/connectors/weather/OpenWeatherMap';
import WeatherLocation from '@/entities/WeatherLocation';
import Weather from '@/entities/Weather';

class WidgetsService {
    bus;
    settings;
    weather;
    storageService;
    weatherService;
    _lastUpd;
    _timer;
    _active;

    constructor(storageService, settingsService) {
        makeAutoObservable(this);
        this.bus = BusApp();
        this.storageService = storageService;
        this.settings = settingsService.settings;
        this.weatherService = new OpenWeatherMap({ storageService });

        const updateWeather = () => {
            if (!this._active) return;
            console.log('Weather update');
            this._lastUpd = Date.now();
            this.storageService.updatePersistent({
                weather: new Weather({
                    ...this.storageService.storage.weather,
                    status: FETCH.PENDING,
                }),
            });
            this.getCurWeather()
                .then(() => {
                    this.storageService.updatePersistent({
                        weather: new Weather({
                            ...this.storageService.storage.weather,
                            status: FETCH.ONLINE,
                        }),
                    });
                })
                .catch((e) => {
                    console.error(e);
                    this.storageService.updatePersistent({
                        weather: new Weather({
                            ...this.storageService.storage.weather,
                            status: FETCH.FAILED,
                            lastUpdateStatus: FETCH.FAILED,
                        }),
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
                this.weatherService.weather?.lastUpdateStatus === FETCH.FAILED
                || !this._lastUpd
                || this._lastUpd + appVariables.widgets.weather.updateTime.inactive <= Date.now()
                || !isFinite(this.weatherService.weather?.currTemp)
            ) {
                console.log('Weather start')
                updateWeather();
            } else {
                console.log(`Weather await ${this._lastUpd + appVariables.widgets.weather.updateTime.inactive - Date.now()}ms`);
                this._timer = setTimeout(start, this._lastUpd + appVariables.widgets.weather.updateTime.inactive - Date.now());
                this.storageService.updatePersistent({
                    weather: new Weather({
                        ...this.storageService.storage.weather,
                        status: FETCH.ONLINE,
                    }),
                });
            }
        };

        const stop = () => {
            console.log('Weather stop');
            this._active = false;
            clearTimeout(this._timer);

            this.storageService.updatePersistent({
                weather: new Weather({
                    ...this.storageService.storage.weather,
                    status: FETCH.STOP,
                }),
            });
        };

        this._lastUpd = this.storageService.storage.weather?.lastUpdateTimestamp;

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

        this.bus.on('widgets/weather/searchLocation', async ({ query }, { }, callback) => {
            console.log('Weather search location', query);

            const result = await this.weatherService.searchLocation(query);

            callback(result);
        });

        this.bus.on('widgets/weather/setLocation', async ({ location }, { }) => {
            console.log('Weather set location', location);

            this.weatherService.setLocation(new WeatherLocation({
                ...location,
                manual: true,
            }));
        });
    }

    async getCurWeather() {
        if (!this.weatherService.location) {
            if (!navigator.geolocation) {
                console.log('Geolocation is not supported for this Browser/OS version yet.');
                throw new Error('Geolocation is not supported');
            }

            console.log('Geolocation is supported!');

            let currPos;

            currPos = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));

            const coords = { latitude: currPos.coords.latitude, longitude: currPos.coords.longitude };

            const locations = await this.weatherService.searchLocation(coords);

            if (locations.length >= 1) {
                this.weatherService.setLocation(new WeatherLocation({
                    ...locations[0].location,
                    manual: false,
                }));
            } else {
                throw new Error('failed get automation location');
            }
        }

        await this.weatherService.getWeather();
    }
}

export default WidgetsService;
