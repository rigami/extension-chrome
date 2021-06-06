class BaseWeatherConnector {
    name = 'BaseWeatherConnector';
    apiKey;

    constructor({ name, apiKey }) {
        this.name = name;
        this.apiKey = apiKey;
    }

    async getCurrentWeather(location) {
        throw new Error(`Method "getCurrentWeather" not override. Props: {location: ${location}}`);
    }

    async searchLocation({ query, latitude, longitude }) {
        throw new Error(`
            Method "searchLocation" not override.
            Props: {query: ${query}, latitude: ${latitude}, longitude: ${longitude}}
        `);
    }
}

export default BaseWeatherConnector;
