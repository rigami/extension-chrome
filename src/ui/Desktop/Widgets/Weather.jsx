import React, { useEffect } from 'react';
import { Link, Typography, Tooltip, Fade, CircularProgress } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import useAppStateService from '@/stores/app/AppStateProvider';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import appVariables from '@/config/appVariables';
import { FETCH, WIDGET_DTW_UNITS } from '@/enum';
import { eventToBackground } from '@/stores/server/bus';

const useStyles = makeStyles((theme) => ({
    root: {
        textShadow: '0 2px 17px #00000029',
        fontFamily: '"Manrope", "Open Sans", sans-serif',
        fontWeight: 800,
    },
    link: {
        position: 'relative',
    },
    loader: {
        position: 'absolute',
        top: 10,
        right: -20,
        color: theme.palette.common.white,
    },
}));


function WeatherWidget({ size }) {
    const classes = useStyles();
    const { t } = useTranslation();
    const { widgets } = useAppStateService();

    useEffect(() => {
        eventToBackground('widgets/weather/update');
    }, []);

    let units;
    let temp;

    if (widgets.settings.dtwWeatherMetrics === WIDGET_DTW_UNITS.FAHRENHEIT) {
        units = '°F';
        temp = ((widgets.weather?.currTemp || 0) - 273.15) * (9/5) + 32;
    } else if (widgets.settings.dtwWeatherMetrics === WIDGET_DTW_UNITS.KELVIN) {
        units = 'К';
        temp = widgets.weather?.currTemp || 0;
    } else {
        units = '°C';
        temp = (widgets.weather?.currTemp || 0) - 273.15;
    }

    return (
        <Fade in={widgets.showWeather}>
            <Tooltip title={t('widgets.weather.openInNewTab')}>
                <Link
                    href={widgets.settings.dtwWeatherAction || widgets.weather?.dashboardUrl}
                    target="_blank"
                    underline="none"
                    color="inherit"
                    className={classes.link}
                >
                    {widgets.weather?.status === FETCH.PENDING && (
                        <CircularProgress className={classes.loader} size={15} />
                    )}
                    <Typography variant={size} className={classes.root}>
                        {widgets.weather?.currTemp ? `${Math.round(temp)} ${units}` : 'Failed get weather data'}
                    </Typography>
                </Link>
            </Tooltip>
        </Fade>
    );
}

export default observer(WeatherWidget);
