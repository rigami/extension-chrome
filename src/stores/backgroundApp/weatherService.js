import { makeAutoObservable, reaction } from 'mobx';
import fetchData from '@/utils/xhrPromise'
import appVariables from '@/config/appVariables';
import BusApp from '@/stores/backgroundApp/busApp';

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
            const lastUpd = this.storageService.storage.widgetWeather.lastUpdateTimestamp;

            if (!lastUpd || lastUpd + appVariables.widgets.weather.updateTime < Date.now()) {
                console.log('START')
                this.getCurWeather().catch(console.error);

                timer = setInterval(() => {
                    this.getCurWeather().catch(console.error);
                }, appVariables.widgets.weather.updateTime);
            } else {
                console.log('AWAIT', lastUpd + appVariables.widgets.weather.updateTime - Date.now())
                setTimeout(start, lastUpd + appVariables.widgets.weather.updateTime - Date.now());
            }
        };

        const stop = () => {
            console.log('STOP')
            clearInterval(timer);
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

        try {
            currPos = await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));
        } catch (e) {
            console.error('Failed get curr pos', e)
        }

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
            lastUpdateTimestamp: Date.now(),
        };

        this.storageService.updatePersistent({ widgetWeather: this.weather });
    }
}

export default WidgetsService;
