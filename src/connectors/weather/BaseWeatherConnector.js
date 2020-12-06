class BaseWeatherConnector {
    name = 'BaseWeatherConnector';
    location;
    weather;
    apiKey;
    storageService;

    constructor({ name, apiKey, storageService }) {
        this.name = name;
        this.apiKey = apiKey;
        this.storageService = storageService;
        this.location = storageService.storage.weatherLocation;
        this.weather = storageService.storage.weather;
    }

    getDashboardUrl() {
        if (!this.weather) throw new Error("weather not set")

        return this.weather.dashboardUrl;
    }

    async getWeather(weather) {
        console.log('Set weather:', weather);
        this.weather = weather;

        this.storageService.updatePersistent({
            weather,
        });
    }

    async searchLocation(query) {
        throw new Error(`Method "searchLocation" not override. Props: {${query}`);
    }

    setLocation(location) {
        console.log('Set location:', location);
        this.location = location;

        this.storageService.updatePersistent({
            weatherLocation: location,
        });
    }
}

export default BaseWeatherConnector;
