import { Box, Typography } from '@material-ui/core';
import clsx from 'clsx';
import React from 'react';
import { observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import Time from '@/ui/Desktop/Widgets/Time';
import Date from '@/ui/Desktop/Widgets/Date';
import WeatherWidget from '@/ui/Desktop/Widgets/Weather';
import useAppService from '@/stores/app/AppStateProvider';

const useStyles = makeStyles((theme) => ({
    row: { alignItems: 'center' },
    text: {
        fontFamily: theme.typography.specialFontFamily,
        fontWeight: 800,
        pointerEvents: 'all',
    },
    time: {
        fontSize: '2.25rem',
        lineHeight: '130%',
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
    const appService = useAppService();
    const { widgets } = appService;

    return (
        <Box className={externalClassName}>
            {widgets.settings.dtwUseTime && (
                <Typography
                    className={clsx(
                        classes.text,
                        classes.time,
                    )}
                >
                    <Time />
                </Typography>
            )}
            {widgets.settings.dtwUseDate && (
                <Typography
                    className={clsx(
                        classes.row,
                        classes.text,
                        classes.date,
                    )}
                >
                    <Date dot={widgets.showWeather} />
                </Typography>
            )}
            {widgets.settings.dtwUseWeather && (
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
