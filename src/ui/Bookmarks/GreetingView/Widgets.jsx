import { Box, Typography } from '@material-ui/core';
import clsx from 'clsx';
import Time from '@/ui/Desktop/Widgets/Time';
import Date from '@/ui/Desktop/Widgets/Date';
import WeatherWidget from '@/ui/Desktop/Widgets/Weather';
import React from 'react';
import useAppService from '@/stores/app/AppStateProvider';
import { observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    row: { alignItems: 'center' },
    text: {
        fontFamily: theme.typography.primaryFontFamily,
        fontWeight: 800,
        pointerEvents: 'all',
    },
    time: {
        fontSize: '2.2rem',
        lineHeight: '130%',
    },
    date: {
        fontSize: '1.5rem',
        lineHeight: '100%',
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
            {(widgets.settings.dtwUseDate || widgets.settings.dtwUseWeather) && (
                <Typography
                    className={clsx(
                        classes.row,
                        classes.text,
                        classes.date,
                    )}
                >
                    {widgets.settings.dtwUseDate && (
                        <Date dot={widgets.showWeather} />
                    )}
                    {widgets.settings.dtwUseWeather && (
                        <WeatherWidget />
                    )}
                </Typography>
            )}
        </Box>
    );
}

export default observer(Widgets);
