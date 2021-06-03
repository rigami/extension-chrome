class BaseWeatherConnector {
    name = 'BaseWeatherConnector';
    location;
    weather;
    apiKey;
    storage;

    constructor({ name, apiKey, storage }) {
        this.name = name;
        this.apiKey = apiKey;
        this.storage = storage;
        this.location = storage.persistent.weatherLocation;
        this.weather = storage.persistent.weather;
    }

    async getWeather(weather) {
        console.log('Set connectors:', weather);
        this.weather = weather;

        if (this.storage.persistent.data.widgetWeather) {
            this.storage.persistent.update({
                weather,
                widgetWeather: null,
            });
        } else {
            this.storage.persistent.update({ weather });
        }
    }

    async searchLocation(query) {
        throw new Error(`Method "searchLocation" not override. Props: {${query}`);
    }

    setLocation(location) {
        console.log('Set location:', location);
        this.location = location;

        this.storage.persistent.update({ weatherLocation: location });
    }
}

export default BaseWeatherConnector;
