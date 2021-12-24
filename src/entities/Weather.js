class Weather {
    location;
    currTemp;
    currTempDescription;
    dashboardUrl;
    lastUpdateStatus;
    lastUpdateTimestamp;
    status;

    constructor(props = {}) {
        this.location = props.location;
        this.currTemp = props.currTemp;
        this.currTempDescription = props.currTempDescription;
        this.dashboardUrl = props.dashboardUrl;
        this.lastUpdateStatus = props.lastUpdateStatus;
        this.lastUpdateTimestamp = props.lastUpdateTimestamp;
        this.status = props.status;
    }
}

export default Weather;
