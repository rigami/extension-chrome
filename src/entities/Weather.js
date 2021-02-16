class Weather {
    location;
    currTemp;
    dashboardUrl;
    lastUpdateStatus;
    lastUpdateTimestamp;
    status;

    constructor({
        location, currTemp, lastUpdateStatus, lastUpdateTimestamp, status, dashboardUrl,
    }) {
        this.location = location;
        this.currTemp = currTemp;
        this.dashboardUrl = dashboardUrl;
        this.lastUpdateStatus = lastUpdateStatus;
        this.lastUpdateTimestamp = lastUpdateTimestamp;
        this.status = status;
    }
}

export default Weather;
