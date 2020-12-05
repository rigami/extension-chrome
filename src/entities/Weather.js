class Weather {
    location;
    currTemp;
    lastUpdateStatus;
    lastUpdateTimestamp;
    status;

    constructor({ location, currTemp, lastUpdateStatus, lastUpdateTimestamp, status }) {
        this.location = location;
        this.currTemp = currTemp;
        this.lastUpdateStatus = lastUpdateStatus;
        this.lastUpdateTimestamp = lastUpdateTimestamp;
        this.status = status;
    }
}

export default Weather;
