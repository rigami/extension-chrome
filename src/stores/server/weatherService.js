import { makeAutoObservable, reaction } from 'mobx';
import appVariables from '@/config/appVariables';
import { eventToApp } from '@/stores/server/bus';
import { FETCH } from '@/enum';
import WeatherLocation from '@/entities/WeatherLocation';
import Weather from '@/entities/Weather';
import { captureException } from '@sentry/react';
import OpenWeatherMap from '@/stores/universal/weather/connectors/OpenWeatherMap';

class WeatherService {
    core;
    connector;
    _lastUpd;
    _timer;
    _active;

    constructor(core) {
        makeAutoObservable(this);
        this.core = core;
        this.storage = this.core.storage.persistent;

        this.subscribe();
    }

    async update() {
        if (!this._active || !this.storage.data.location || !this.storage.data.location?.id) return;
        console.log('[weather] Update...');
        this._lastUpd = Date.now();
        this.storage.update({
            weather: new Weather({
                ...this.storage.data.weather,
                status: FETCH.PENDING,
            }),
        });

        try {
            const weather = await this.connector.getCurrentWeather(this.storage.data.location);

            console.log('[weather] Success update weather. Current weather:', weather);

            this.storage.update({
                weather: new Weather({
                    ...weather,
                    status: FETCH.ONLINE,
                }),
            });
        } catch (e) {
            console.error('[weather] Failed get current weather:', e);
            captureException(e);
            this.storage.update({
                weather: new Weather({
                    ...this.storage.data.weather,
                    status: FETCH.FAILED,
                    lastUpdateStatus: FETCH.FAILED,
                }),
            });
        }

        eventToApp('system/ping', 'connectors-check', (pong) => {
            let time = appVariables.widgets.weather.updateTime.inactive;

            if (pong && pong.type === 'connectors-check') {
                time = appVariables.widgets.weather.updateTime.active;
            }

            this._lastUpd = Date.now();
            this._timer = setTimeout(this.update, time);
            console.log(`[weather] Await ${time}ms for next update...`);
        });
    }

    searchLocation(location) {
        console.log('Set location:', location);
        this.location = location;

        this.storage.persistent.update({ location });
    }

    start() {
        clearTimeout(this._timer);
        this._active = true;

        if (
            this.storage.data.weather?.lastUpdateStatus === FETCH.FAILED
            || !this._lastUpd
            || this._lastUpd + appVariables.widgets.weather.updateTime.inactive <= Date.now()
            || !isFinite(this.connector.weather?.currTemp)
        ) {
            console.log('[weather] Start service');
            this.update();
        } else {
            console.log(`[weather] Await ${
                this._lastUpd + appVariables.widgets.weather.updateTime.inactive - Date.now()
            }ms`);
            this._timer = setTimeout(
                this.start,
                this._lastUpd + appVariables.widgets.weather.updateTime.inactive - Date.now(),
            );
            this.storage.update({
                weather: new Weather({
                    ...this.storage.data.weather,
                    status: FETCH.ONLINE,
                }),
            });
        }
    }

    stop() {
        console.log('[weather] Stop service');
        this._active = false;
        clearTimeout(this._timer);

        this.storage.update({
            weather: new Weather({
                ...this.storage.data.weather,
                status: FETCH.STOP,
            }),
        });
    }

    subscribe() {
        this.connector = new OpenWeatherMap();
        this._lastUpd = this.storage.data.weather?.lastUpdateTimestamp;

        reaction(
            () => this.core.settingsService.widgets?.dtwUseWeather,
            () => {
                if (this.core.settingsService.widgets?.dtwUseWeather) this.start();
                else this.stop();
            },
        );

        if (this.core.settingsService.widgets.dtwUseWeather) this.start();

        this.core.globalEventBus.on('weather/forceUpdate', ({ data: location }) => {
            console.log('[weather] Request force update. Location:', location);

            if (location || this._lastUpd + appVariables.widgets.weather.updateTime.active < Date.now()) {
                this.storage.update({ location: new WeatherLocation(location) });

                console.log('[weather] Force update...');
                this.update();
            } else {
                console.log(`[weather] Last update less ${appVariables.widgets.weather.updateTime.active}ms ago`);
                clearTimeout(this._timer);
                console.log(`[weather] Await ${
                    this._lastUpd + appVariables.widgets.weather.updateTime.active - Date.now()
                }ms`);
                this._timer = setTimeout(
                    this.update,
                    this._lastUpd + appVariables.widgets.weather.updateTime.active - Date.now(),
                );
            }
        });
    }
}

export default WeatherService;
