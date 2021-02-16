class WeatherLocation {
    id;
    name;
    latitude;
    longitude;
    manual;

    constructor({
        id, name, latitude, longitude, manual,
    }) {
        this.id = id;
        this.name = name;
        this.latitude = latitude;
        this.longitude = longitude;
        this.manual = manual;
    }
}

export default WeatherLocation;
