import appVariables from '@/config/appVariables';
import fetchData from '@/utils/fetchData';
import WeatherLocation from '@/entities/WeatherLocation';
import { FETCH } from '@/enum';
import Weather from '@/entities/Weather';
import BaseWeatherConnector from './BaseWeatherConnector';

class OpenWeatherMap extends BaseWeatherConnector {
    constructor() {
        super({
            name: 'OpenWeatherMap',
            apiKey: appVariables.weather.services.openweathermap.apiKey,
        });
    }

    async getCurrentWeather(location) {
        const { response: weather } = await fetchData(
            `http://api.openweathermap.org/data/2.5/weather?id=${location.id}&appid=${this.apiKey}`,
        );

        return new Weather({
            location,
            currTemp: weather.main.temp,
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
                }&q=${
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
            }&appid=${
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
