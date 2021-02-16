import appVariables from '@/config/appVariables';
import fetchData from '@/utils/xhrPromise';
import WeatherLocation from '@/entities/WeatherLocation';
import { FETCH } from '@/enum';
import Weather from '@/entities/Weather';
import BaseWeatherConnector from './BaseWeatherConnector';

class OpenWeatherMap extends BaseWeatherConnector {
    constructor(props) {
        super({
            name: 'OpenWeatherMap',
            apiKey: appVariables.widgets.weather.services.openweathermap.apiKey,
            ...props,
        });
    }

    async getWeather() {
        if (!this.location) throw new Error('location not set');

        const { response: weather } = await fetchData(
            `http://api.openweathermap.org/data/2.5/weather?id=${this.location.id}&appid=${this.apiKey}`,
        );

        await super.getWeather(new Weather({
            location: this.location,
            currTemp: weather.main.temp,
            lastUpdateStatus: FETCH.DONE,
            lastUpdateTimestamp: Date.now(),
            status: FETCH.ONLINE,
            dashboardUrl: `https://openweathermap.org/city/${this.location.id}`,
        }));
    }

    async searchLocation(query) {
        if (typeof query === 'object') {
            const { response } = await fetchData(
                `http://api.openweathermap.org/data/2.5/weather?lat=${
                    query.latitude
                }&lon=${
                    query.longitude
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
        } else {
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
    }

    setLocation(location) {
        super.setLocation(location);

        this.getWeather();
    }
}

export default OpenWeatherMap;
