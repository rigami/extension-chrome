import { toJS } from 'mobx';
import appVariables from '@/config/appVariables';
import fetchData from '@/utils/helpers/fetchData';
import WeatherLocation from '@/entities/WeatherLocation';
import { FETCH } from '@/enum';
import Weather from '@/entities/Weather';
import BaseWeatherConnector from './BaseWeatherConnector';
import BrowserAPI from '@/utils/browserAPI';

class OpenWeatherMap extends BaseWeatherConnector {
    constructor() {
        super({
            name: 'OpenWeatherMap',
            apiKey: appVariables.widgets.weather.services.openweathermap.apiKey,
        });
    }

    async getCurrentWeather(location) {
        console.log('location:', toJS(location));

        const { response: weather } = await fetchData(
            `http://api.openweathermap.org/data/2.5/weather?id=${location.id}&lang=${BrowserAPI.systemLanguage}&appid=${this.apiKey}`,
        );

        console.log('weather:', weather);

        return new Weather({
            location,
            currTemp: weather.main.temp,
            currTempDescription: weather.weather[0].description,
            lastUpdateStatus: FETCH.DONE,
            lastUpdateTimestamp: Date.now(),
            status: FETCH.ONLINE,
            dashboardUrl: `https://openweathermap.org/city/${location.id}`,
        });
    }

    async searchLocation({ query, latitude, longitude }) {
        if (query) {
            if (query.length < 3) return [];

            const { response } = await fetchData(
                `https://api.openweathermap.org/data/2.5/find?type=like&sort=population&cnt=5&appid=${
                    this.apiKey
                }&lang=${BrowserAPI.systemLanguage}&q=${
                    query
                }`,
            );

            return response.list.map((item) => ({
                location: new WeatherLocation({
                    id: item.id,
                    name: item.name,
                    latitude: item.coord.lat,
                    longitude: item.coord.lon,
                }),
                currTemp: item.main.temp,
            }));
        }

        const { response } = await fetchData(
            `http://api.openweathermap.org/data/2.5/weather?lat=${
                latitude
            }&lon=${
                longitude
            }&lang=${BrowserAPI.systemLanguage}&appid=${
                this.apiKey
            }`,
        );

        return [
            {
                location: new WeatherLocation({
                    id: response.id,
                    name: response.name,
                    latitude: response.coord.lat,
                    longitude: response.coord.lon,
                }),
                currTemp: response.main.temp,
            },
        ];
    }
}

export default OpenWeatherMap;
