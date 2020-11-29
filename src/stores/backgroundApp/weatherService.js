import { makeAutoObservable, reaction } from 'mobx';
import fetchData from '@/utils/xhrPromise'
import appVariables from '@/config/appVariables';
import BusApp from '@/stores/backgroundApp/busApp';
import { WIDGET_DTW_UNITS } from '@/enum';

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

        console.log(this.settings)

        reaction(
            () => settingsService.settings.widgets.dtwUseWeather,
            () => { if (settingsService.settings.widgets.dtwUseWeather) this.getCurWeather().catch(console.error); },
        );

        if (settingsService.settings.widgets.dtwUseWeather) this.getCurWeather().catch(console.error);

        setInterval(() => {
            this.getCurWeather().catch(console.error);
        }, appVariables.widgets.weather.updateTime);
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
        };

        this.storageService.updatePersistent({ widgetWeather: this.weather });
    }
}

export default WidgetsService;
