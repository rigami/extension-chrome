import React, { useEffect, useState } from 'react';
import { Link, Typography, Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import useAppStateService from '@/stores/AppStateProvider';
import { useObserver } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';

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

    /* if (widgets.settings.dtwDateAction) {
        return (
            <Link
                href={widgets.settings.dtwDateAction}
                target="_blank"
                underline="none"
                color="inherit"
                className={classes.link}
            >
                <Typography variant={size} className={classes.root}>
                    {formatter.format(now)}
                </Typography>
            </Link>
        );
    } */

    return useObserver(() => (
        <Tooltip title={t('widgets.weather.openInNewTab')}>
            <Typography variant={size} className={classes.root}>
                {widgets.weather?.currTemp} °C
            </Typography>
        </Tooltip>
    ));
}

export default WeatherWidget;
