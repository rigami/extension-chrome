import React, { useEffect } from 'react';
import {
    Link,
    Tooltip,
    Fade,
    CircularProgress,
    Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'lodash';
import { useAppStateService } from '@/stores/app/appState';
import { FETCH, WIDGET_UNITS } from '@/enum';
import { eventToBackground } from '@/stores/universal/serviceBus';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'inline-block',
        whiteSpace: 'nowrap',
        pointerEvents: 'all',
    },
    link: { position: 'relative' },
    loader: {
        position: 'absolute',
        top: 10,
        right: -20,
        color: theme.palette.common.white,
    },
    description: { marginLeft: theme.spacing(1) },
}));

function WeatherWidget() {
    const classes = useStyles();
    const { t } = useTranslation(['desktop']);
    const { widgetsService } = useAppStateService();

    useEffect(() => {
        eventToBackground('widgets/weather/update');
    }, []);

    let units;
    let temp;

    if (widgetsService.settings.weatherMetrics === WIDGET_UNITS.FAHRENHEIT) {
        units = '°';
        temp = ((widgetsService.weather?.currTemp || 0) - 273.15) * (9 / 5) + 32;
    } else if (widgetsService.settings.weatherMetrics === WIDGET_UNITS.KELVIN) {
        units = 'К';
        temp = widgetsService.weather?.currTemp || 0;
    } else {
        units = '°';
        temp = (widgetsService.weather?.currTemp || 0) - 273.15;
    }

    return (
        <Fade in={widgetsService.showWeather}>
            <Tooltip title={t('widget.weather.button.openInNewTab')}>
                <span className={classes.root}>
                    <Link
                        href={widgetsService.settings.weatherAction || widgetsService.weather?.dashboardUrl}
                        target="_blank"
                        underline="none"
                        color="inherit"
                        className={classes.link}
                    >
                        {widgetsService.weather?.status === FETCH.PENDING && (
                            <CircularProgress className={classes.loader} size={15} />
                        )}
                        {
                            widgetsService.weather?.currTemp
                                ? `${Math.round(temp)} ${units}`
                                : t('widget.weather.error.unavailable')
                        }
                        {widgetsService.weather?.currTempDescription && (
                            <span className={classes.description}>
                                {capitalize(widgetsService.weather?.currTempDescription)}
                            </span>
                        )}
                    </Link>
                </span>
            </Tooltip>
        </Fade>
    );
}

export default observer(WeatherWidget);
