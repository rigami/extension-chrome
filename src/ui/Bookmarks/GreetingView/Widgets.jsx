import { Box, Typography } from '@material-ui/core';
import clsx from 'clsx';
import React from 'react';
import { observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import Time from '@/ui/Desktop/Widgets/Time';
import Date from '@/ui/Desktop/Widgets/Date';
import WeatherWidget from '@/ui/Desktop/Widgets/Weather';
import { useAppStateService } from '@/stores/app/appState';

const useStyles = makeStyles((theme) => ({
    row: { alignItems: 'center' },
    text: {
        fontFamily: theme.typography.specialFontFamily,
        fontWeight: 800,
        pointerEvents: 'all',
    },
    time: {
        fontSize: '2.25rem',
        lineHeight: '90%',
    },
    date: {
        fontSize: '1.5rem',
        lineHeight: '100%',
    },
    weather: {
        fontSize: '0.875rem',
        lineHeight: '100%',
        marginTop: theme.spacing(2),
    },
}));

function Widgets({ className: externalClassName }) {
    const classes = useStyles();
    const appStateService = useAppStateService();
    const { widgetsService } = appStateService;

    return (
        <Box className={externalClassName}>
            {widgetsService.settings.useTime && (
                <Typography
                    className={clsx(
                        classes.text,
                        classes.time,
                    )}
                >
                    <Time />
                </Typography>
            )}
            {widgetsService.settings.useDate && (
                <Typography
                    className={clsx(
                        classes.row,
                        classes.text,
                        classes.date,
                    )}
                >
                    <Date dot={widgetsService.showWeather} />
                </Typography>
            )}
            {widgetsService.settings.useWeather && (
                <Typography
                    className={clsx(
                        classes.row,
                        classes.text,
                        classes.weather,
                    )}
                >
                    <WeatherWidget />
                </Typography>
            )}
        </Box>
    );
}

export default observer(Widgets);
