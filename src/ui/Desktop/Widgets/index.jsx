import React, { useCallback } from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { useResizeDetector } from 'react-resize-detector';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import {
    ACTIVITY,
    BKMS_FAP_POSITION,
} from '@/enum';
import DTW_POSITION from '@/enum/WIDGET/DTW_POSITION';
import WeatherWidget from '@/ui/Desktop/Widgets/Weather';
import useAppService from '@/stores/app/AppStateProvider';
import useBaseStateService from '@/stores/app/BaseStateProvider';
import Time from './Time';
import Date from './Date';

const useStyles = makeStyles((theme) => ({
    root: {
        position: 'absolute',
        zIndex: 1,
        top: theme.spacing(4),
        right: theme.spacing(11),
        bottom: theme.spacing(6),
        left: theme.spacing(11),
        color: theme.palette.common.white,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        textShadow: '0 2px 17px #00000029',
    },
    widget: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: theme.transitions.create(['transform'], {
            easing: theme.transitions.easing.shiftEaseInOut,
            duration: theme.transitions.duration.long,
        }),
    },
    leftBottom: {
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        '& $widget': {
            alignItems: 'flex-start',
            transformOrigin: 'left bottom',
        },
    },
    leftMiddle: {
        alignItems: 'flex-start',
        '& $widget': {
            alignItems: 'flex-start',
            transformOrigin: 'left bottom',
        },
    },
    centerTop: { '& $widget': { transformOrigin: 'center bottom' } },
    row: { alignItems: 'center' },
    divider: {
        margin: theme.spacing(0, 2),
        backgroundColor: theme.palette.common.white,
    },
    text: {
        fontFamily: theme.typography.primaryFontFamily,
        fontWeight: 700,
        pointerEvents: 'all',
        transition: theme.transitions.create(['color', 'textShadow'], {
            easing: theme.transitions.easing.shiftEaseInOut,
            duration: theme.transitions.duration.long,
        }),
    },
    weather: { marginTop: '4%' },
    'time-smaller': {
        fontSize: '2rem',
        lineHeight: '90%',
    },
    'time-small': {
        fontSize: '4rem',
        lineHeight: '90%',
    },
    'time-middle': {
        fontSize: '6.1rem',
        lineHeight: '90%',
    },
    'time-big': {
        fontSize: '8.3rem',
        lineHeight: '100%',
    },
    'time-bigger': {
        fontSize: '13rem',
        lineHeight: '110%',
    },
    'date-smaller': {
        fontSize: '1.6rem',
        lineHeight: '100%',
    },
    'date-small': {
        fontSize: '3rem',
        lineHeight: '100%',
    },
    'date-middle': {
        fontSize: '3.8rem',
        lineHeight: '100%',
    },
    'date-big': {
        fontSize: '4.9rem',
        lineHeight: '100%',
    },
    'date-bigger': {
        fontSize: '7rem',
        lineHeight: '100%',
    },
    'weather-smaller': {
        fontSize: '1.2rem',
        lineHeight: '100%',
    },
    'weather-small': {
        fontSize: '1.5rem',
        lineHeight: '100%',
    },
    'weather-middle': {
        fontSize: '2rem',
        lineHeight: '100%',
    },
    'weather-big': {
        fontSize: '3rem',
        lineHeight: '100%',
    },
    'weather-bigger': {
        fontSize: '4rem',
        lineHeight: '100%',
    },
}));

function Widgets({ stickToBottom, color }) {
    const classes = useStyles();
    const service = useBaseStateService();
    const appService = useAppService();
    const { widgets } = appService;
    const bookmarksService = useBookmarksService();
    const { height: heightRoot, ref: refRoot } = useResizeDetector();

    const onResize = useCallback((width, height) => {
        service.storage.temp.update({ desktopWidgetsHeight: height });
    }, []);

    const { height: heightWidget, ref: refWidget } = useResizeDetector({ onResize });

    let positionOffset = '';

    if (BUILD === 'full') {
        if (
            (
                bookmarksService.fapIsDisplay
                && bookmarksService.settings.fapPosition === BKMS_FAP_POSITION.BOTTOM
            ) || appService.activity === ACTIVITY.FAVORITES
        ) {
            positionOffset = 'bottom';
        } else if (
            bookmarksService.fapIsDisplay
            && bookmarksService.settings.fapPosition === BKMS_FAP_POSITION.TOP
        ) {
            positionOffset = 'top';
        }
    }

    return (
        <Box
            className={clsx(
                classes.root,
                widgets.settings.dtwPosition === DTW_POSITION.LEFT_BOTTOM && classes.leftBottom,
                widgets.settings.dtwPosition === DTW_POSITION.LEFT_MIDDLE && classes.leftMiddle,
                widgets.settings.dtwPosition === DTW_POSITION.CENTER_TOP && classes.centerTop,
            )}
            style={{
                [positionOffset]: service.storage.temp.data.desktopFapHeight,
                color,
                textShadow: color ? '0 2px 17px #00000000' : '0 2px 17px #00000029',
            }}
            ref={refRoot}
        >
            <Box
                className={classes.widget}
                ref={refWidget}
                style={{
                    transform: stickToBottom && `${
                        widgets.settings.dtwPosition !== DTW_POSITION.LEFT_BOTTOM
                            ? `translateY(calc(${heightRoot / 2}px - ${heightWidget / 2}px))`
                            : ''
                    } scale(${64 / heightWidget})`,
                }}
            >
                {widgets.settings.dtwUseTime && (
                    <Typography
                        className={clsx(
                            classes.text,
                            classes[`time-${widgets.settings.dtwSize.toLowerCase()}`],
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
                            classes[`date-${widgets.settings.dtwSize.toLowerCase()}`],
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
                            classes[`weather-${widgets.settings.dtwSize.toLowerCase()}`],
                        )}
                    >
                        <WeatherWidget />
                    </Typography>
                )}
            </Box>
        </Box>
    );
}

export default observer(Widgets);
