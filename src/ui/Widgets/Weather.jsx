import React from 'react';
import { Link, Typography, Tooltip, Fade } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import useAppStateService from '@/stores/AppStateProvider';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import appVariables from '@/config/appVariables';
import { FETCH, WIDGET_DTW_UNITS } from '@/enum';

const useStyles = makeStyles(() => ({
    root: {
        textShadow: '0 2px 17px #00000029',
        fontFamily: '"Manrope", "Open Sans", sans-serif',
        fontWeight: 800,
    },
    link: {},
}));


function WeatherWidget({ size }) {
    const classes = useStyles();
    const { t } = useTranslation();
    const { widgets } = useAppStateService();

    let units;
    let temp;

    if (widgets.settings.dtwWeatherMetrics === WIDGET_DTW_UNITS.FAHRENHEIT) {
        units = '°F';
        temp = ((widgets.weather?.currTemp || 0) - 273.15) * (9/5) + 32;
    } else if (widgets.settings.dtwWeatherMetrics === WIDGET_DTW_UNITS.KELVIN) {
        units = 'К';
        temp = widgets.weather?.currTemp;
    } else {
        units = '°C';
        temp = (widgets.weather?.currTemp || 0) - 273.15;
    }

    return (
        <Fade in={widgets.weather?.status === FETCH.ONLINE}>
            <Tooltip title={t('widgets.weather.openInNewTab')}>
                <Link
                    href={widgets.settings.dtwWeatherAction || appVariables.widgets.weather.services.openweathermap.dashboard}
                    target="_blank"
                    underline="none"
                    color="inherit"
                    className={classes.link}
                >
                    <Typography variant={size} className={classes.root}>
                        {`${Math.round(temp)} ${units}`}
                    </Typography>
                </Link>
            </Tooltip>
        </Fade>
    );
}

export default observer(WeatherWidget);
