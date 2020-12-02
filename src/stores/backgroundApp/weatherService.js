import { makeAutoObservable, reaction } from 'mobx';
import fetchData from '@/utils/xhrPromise'
import appVariables from '@/config/appVariables';
import BusApp from '@/stores/backgroundApp/busApp';
import { FETCH } from '@/enum';

class WidgetsService {
    bus;
    settings;
    weather;
    storageService;

    constructor(storageService, settingsService) {
        makeAutoObservable(this);
        this.bus = BusApp();
        this.storageService = storageService;
        this.settings = settingsService.settings;

        let timer;

        const start = () => {
            const lastUpd = this.storageService.storage.widgetWeather?.lastUpdateTimestamp;

            this.storageService.updatePersistent({
                widgetWeather: {
                    ...this.storageService.storage.widgetWeather,
                    status: FETCH.PENDING,
                },
            });

            if (!lastUpd || lastUpd + appVariables.widgets.weather.updateTime < Date.now()) {
                console.log('START')
                this.getCurWeather()
                    .catch((e) => {
                        console.error(e);
                        this.storageService.updatePersistent({
                            widgetWeather: {
                                ...this.storageService.storage.widgetWeather,
                                status: FETCH.FAILED,
                            },
                        });
                    });

                timer = setInterval(() => {
                    this.getCurWeather()
                        .catch((e) => {
                            console.error(e);
                            this.storageService.updatePersistent({
                                widgetWeather: {
                                    ...this.storageService.storage.widgetWeather,
                                    status: FETCH.FAILED,
                                },
                            });
                        });
                }, appVariables.widgets.weather.updateTime);
            } else {
                console.log('AWAIT', lastUpd + appVariables.widgets.weather.updateTime - Date.now())
                setTimeout(start, lastUpd + appVariables.widgets.weather.updateTime - Date.now());

                this.storageService.updatePersistent({
                    widgetWeather: {
                        ...this.storageService.storage.widgetWeather,
                        status: FETCH.ONLINE,
                    },
                });
            }
        };

        const stop = () => {
            console.log('STOP')
            clearInterval(timer);

            this.storageService.updatePersistent({
                widgetWeather: {
                    ...this.storageService.storage.widgetWeather,
                    status: FETCH.STOP,
                },
            });
        };

        reaction(
            () => this.settings.widgets.dtwUseWeather,
            () => {
                if (this.settings.widgets.dtwUseWeather) start();
                else stop();
            },
        );

        if (this.settings.widgets.dtwUseWeather) start();

        console.log(this.settings)
    }

    async getCurWeather() {
        if (!navigator.geolocation) {
            console.log('Geolocation is not supported for this Browser/OS version yet.');
            return;
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
            lastUpdateTimestamp: Date.now(),
            status: FETCH.ONLINE,
        };

        this.storageService.updatePersistent({
            widgetWeather: this.weather,
        });
    }
}

export default WidgetsService;
