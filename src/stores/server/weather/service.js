import { makeAutoObservable, reaction, toJS } from 'mobx';
import appVariables from '@/config/appVariables';
import { eventToApp } from '@/stores/server/bus';
import { FETCH } from '@/enum';
import OpenWeatherMap from './connectors/OpenWeatherMap';
import WeatherLocation from '@/entities/WeatherLocation';
import Weather from '@/entities/Weather';

class WeatherService {
    core;
    weatherConnector;
    _lastUpd;
    _timer;
    _active;

    constructor(core) {
        makeAutoObservable(this);
        this.core = core;
        this.weatherConnector = new OpenWeatherMap(core);

        const updateWeather = () => {
            if (!this._active) return;
            console.log('[weather] Update...');
            this._lastUpd = Date.now();
            this.core.storageService.updatePersistent({
                weather: new Weather({
                    ...this.core.storageService.storage.weather,
                    status: FETCH.PENDING,
                }),
            });
            this.getCurWeather()
                .then(() => {
                    this.core.storageService.updatePersistent({
                        weather: new Weather({
                            ...this.core.storageService.storage.weather,
                            status: FETCH.ONLINE,
                        }),
                    });
                })
                .catch((e) => {
                    console.error('[weather] Failed get current weather:', e);
                    this.core.storageService.updatePersistent({
                        weather: new Weather({
                            ...this.core.storageService.storage.weather,
                            status: FETCH.FAILED,
                            lastUpdateStatus: FETCH.FAILED,
                        }),
                    });
                })
                .finally(() => {
                    eventToApp('system/ping', 'connectors-check', (pong) => {
                        let time = appVariables.widgets.weather.updateTime.inactive;

                        if (pong && pong.type === 'connectors-check') {
                            time = appVariables.widgets.weather.updateTime.active;
                        }

                        this._lastUpd = Date.now();
                        this._timer = setTimeout(updateWeather, time);
                        console.log(`[weather] Await ${time}ms`);
                    });
                });
        }

        const start = () => {
            clearTimeout(this._timer);
            this._active = true;

            if (
                this.weatherConnector.weather?.lastUpdateStatus === FETCH.FAILED
                || !this._lastUpd
                || this._lastUpd + appVariables.widgets.weather.updateTime.inactive <= Date.now()
                || !isFinite(this.weatherConnector.weather?.currTemp)
                || this.core.storageService.widgetWeather
            ) {
                console.log('[weather] Start service')
                updateWeather();
            } else {
                console.log(`[weather] Await ${this._lastUpd + appVariables.widgets.weather.updateTime.inactive - Date.now()}ms`);
                this._timer = setTimeout(start, this._lastUpd + appVariables.widgets.weather.updateTime.inactive - Date.now());
                this.core.storageService.updatePersistent({
                    weather: new Weather({
                        ...this.core.storageService.storage.weather,
                        status: FETCH.ONLINE,
                    }),
                });
            }
        };

        const stop = () => {
            console.log('[weather] Stop service');
            this._active = false;
            clearTimeout(this._timer);

            this.core.storageService.updatePersistent({
                weather: new Weather({
                    ...this.core.storageService.storage.weather,
                    status: FETCH.STOP,
                }),
            });
        };

        this._lastUpd = this.core.storageService.storage.weather?.lastUpdateTimestamp;

        reaction(
            () => this.core.settingsService.settings.widgets.dtwUseWeather,
            () => {
                if (this.core.settingsService.settings.widgets.dtwUseWeather) start();
                else stop();
            },
        );

        if (this.core.settingsService.settings.widgets.dtwUseWeather) start();

        this.core.globalBus.on('widgets/connectors/update', () => {
            console.log('[weather] Request force update');
            if (this._lastUpd + appVariables.widgets.weather.updateTime.active < Date.now()) {
                console.log('[weather] Force update...');
                updateWeather();
            } else {
                console.log(`[weather] Last update less ${appVariables.widgets.weather.updateTime.active}ms ago`);
                clearTimeout(this._timer);
                console.log(`[weather] Await ${this._lastUpd + appVariables.widgets.weather.updateTime.active - Date.now()}ms`);
                this._timer = setTimeout(updateWeather, this._lastUpd + appVariables.widgets.weather.updateTime.active - Date.now());
            }
        });

        this.core.globalBus.on('widgets/connectors/searchLocation', async ({ query }, { }, callback) => {
            console.log('[weather] Search location for query:', query);

            try {
                const result = await this.weatherConnector.searchLocation(query);

                callback({ success: true, result });
            } catch (e) {
                callback({ success: false })
            }
        });

        this.core.globalBus.on('widgets/connectors/autoDetectLocation', async ({}, {}, callback) => {
            console.log('[weather] Auto detect location');

            try {
                await this.autoDetectLocation();
                callback(true);
            } catch (e) {
                callback(false);
            }
        });

        this.core.globalBus.on('widgets/connectors/setLocation', async ({ location }, { }) => {
            console.log('[weather] Set manual location', location);

            this.weatherConnector.setLocation(new WeatherLocation({
                ...location,
                manual: true,
            }));
        });
    }

    async autoDetectLocation() {
        if (!navigator.geolocation) {
            console.log('[weather] Geolocation is not supported for this Browser/OS version yet.');
            throw new Error('Geolocation is not supported');
        }

        console.log('[weather] Geolocation is supported!');

        let currPos;

        currPos = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));

        console.log('[weather] Current position', currPos)

        const coords = { latitude: currPos.coords.latitude, longitude: currPos.coords.longitude };

        const locations = await this.weatherConnector.searchLocation(coords);

        if (locations.length >= 1) {
            this.weatherConnector.setLocation(new WeatherLocation({
                ...locations[0].location,
                manual: false,
            }));
        } else {
            throw new Error('failed get automation location');
        }
    }

    async getCurWeather() {
        if (!this.weatherConnector.location) {
            await this.autoDetectLocation();
        }

        await this.weatherConnector.getWeather();
    }
}

export default WeatherService;
