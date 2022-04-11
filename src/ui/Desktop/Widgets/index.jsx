import React, { useCallback } from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import { useResizeDetector } from 'react-resize-detector';
import { useWorkingSpaceService } from '@/stores/app/workingSpace';
import {
    ACTIVITY,
    BKMS_FAP_POSITION,
    BKMS_FAP_STYLE,
    WIDGET_POSITION,
} from '@/enum';
import WeatherWidget from '@/ui/Desktop/Widgets/Weather';
import { useAppStateService } from '@/stores/app/appState';
import { useCoreService } from '@/stores/app/core';
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
        fontFamily: theme.typography.specialFontFamily,
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
    xLeft: {
        alignItems: 'flex-start',
        '& $widget': { alignItems: 'flex-start' },
    },
    xCenter: { alignItems: 'center' },
    xRight: {
        alignItems: 'flex-end',
        '& $widget': { alignItems: 'flex-end' },
    },
    yTop: { justifyContent: 'flex-start' },
    yMiddle: { justifyContent: 'center' },
    yBottom: { justifyContent: 'flex-end' },
}));

function Widgets({ stickToBottom, color }) {
    const classes = useStyles();
    const theme = useTheme();
    const service = useCoreService();
    const appStateService = useAppStateService();
    const { widgetsService, desktopService } = appStateService;
    const workingSpaceService = useWorkingSpaceService();
    const { height: heightRoot, ref: refRoot } = useResizeDetector();

    const onResize = useCallback((width, height) => {
        service.tempStorage.update({ desktopWidgetsHeight: height });
    }, []);

    const { height: heightWidget, ref: refWidget } = useResizeDetector({ onResize });

    let positionOffsetSide = '';
    let positionOffset = '';

    if (BUILD === 'full') {
        if (
            (
                workingSpaceService.favorites.length !== 0
                && desktopService.settings.fapStyle !== BKMS_FAP_STYLE.HIDDEN
                && desktopService.settings.fapPosition === BKMS_FAP_POSITION.BOTTOM
            ) || appStateService.activity === ACTIVITY.FAVORITES
        ) {
            positionOffsetSide = 'bottom';
            positionOffset = service.tempStorage.data.desktopFapHeight;
        } else if (
            workingSpaceService.favorites.length !== 0
            && desktopService.settings.fapStyle !== BKMS_FAP_STYLE.HIDDEN
            && desktopService.settings.fapPosition === BKMS_FAP_POSITION.TOP
        ) {
            positionOffsetSide = 'top';
            positionOffset = Math.max(service.tempStorage.data.desktopFapHeight, theme.spacing(4) + 36);
        }
    }

    const positions = {
        [WIDGET_POSITION.LEFT_TOP]: {
            classes: [classes.xLeft, classes.yTop],
            x: 'left',
            y: 'top',
        },
        [WIDGET_POSITION.CENTER_TOP]: {
            classes: [classes.xCenter, classes.yTop],
            x: 'center',
            y: 'top',
        },
        [WIDGET_POSITION.RIGHT_TOP]: {
            classes: [classes.xRight, classes.yTop],
            x: 'right',
            y: 'top',
        },
        [WIDGET_POSITION.LEFT_MIDDLE]: {
            classes: [classes.xLeft, classes.yMiddle],
            x: 'left',
            y: 'center',
        },
        [WIDGET_POSITION.CENTER_MIDDLE]: {
            classes: [classes.xCenter, classes.yMiddle],
            x: 'center',
            y: 'center',
        },
        [WIDGET_POSITION.RIGHT_MIDDLE]: {
            classes: [classes.xRight, classes.yMiddle],
            x: 'right',
            y: 'center',
        },
        [WIDGET_POSITION.LEFT_BOTTOM]: {
            classes: [classes.xLeft, classes.yBottom],
            x: 'left',
            y: 'bottom',
        },
        [WIDGET_POSITION.CENTER_BOTTOM]: {
            classes: [classes.xCenter, classes.yBottom],
            x: 'center',
            y: 'bottom',
        },
        [WIDGET_POSITION.RIGHT_BOTTOM]: {
            classes: [classes.xRight, classes.yBottom],
            x: 'right',
            y: 'bottom',
        },
    };

    let translate = '';

    if (
        desktopService.settings.widgetsPosition === WIDGET_POSITION.LEFT_MIDDLE
        || desktopService.settings.widgetsPosition === WIDGET_POSITION.CENTER_MIDDLE
        || desktopService.settings.widgetsPosition === WIDGET_POSITION.RIGHT_MIDDLE
    ) {
        translate = `translateY(calc(${heightRoot / 2}px - ${64 / 2}px))`;
    } else if (
        desktopService.settings.widgetsPosition === WIDGET_POSITION.LEFT_TOP
        || desktopService.settings.widgetsPosition === WIDGET_POSITION.CENTER_TOP
        || desktopService.settings.widgetsPosition === WIDGET_POSITION.RIGHT_TOP
    ) {
        translate = `translateY(calc(${heightRoot}px - ${64}px))`;
    }

    const currPosition = positions[desktopService.settings.widgetsPosition];

    return (
        <Box
            className={clsx(
                classes.root,
                ...currPosition.classes,
            )}
            style={{
                top: theme.spacing(4) + 36,
                [positionOffsetSide]: positionOffset,
                color,
                textShadow: color ? '0 2px 17px #00000000' : '0 2px 17px #00000029',
            }}
            ref={refRoot}
        >
            <Box
                className={classes.widget}
                ref={refWidget}
                style={{
                    transform: stickToBottom && `${translate} scale(${64 / heightWidget})`,
                    transformOrigin: `${currPosition.x} ${currPosition.y}`,
                }}
            >
                {widgetsService.settings.useTime && (
                    <Typography
                        className={clsx(
                            classes.text,
                            classes[`time-${desktopService.settings.widgetsSize.toLowerCase()}`],
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
                            classes[`date-${desktopService.settings.widgetsSize.toLowerCase()}`],
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
                            classes[`weather-${desktopService.settings.widgetsSize.toLowerCase()}`],
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
