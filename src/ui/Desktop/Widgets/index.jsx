import React, { useCallback, useEffect, useState } from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import {
    ACTIVITY, BKMS_FAP_POSITION, BKMS_FAP_STYLE, SERVICE_STATE,
} from '@/enum';
import clsx from 'clsx';
import DTW_POSITION from '@/enum/WIDGET/DTW_POSITION';
import WeatherWidget from '@/ui/Desktop/Widgets/Weather';
import { useTheme } from '@material-ui/styles';
import { useResizeDetector } from 'react-resize-detector';
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
        textShadow: '0 2px 17px #00000029',
        fontFamily: theme.typography.primaryFontFamily,
        fontWeight: 800,
        pointerEvents: 'all',
    },
    'time-smaller': {
        fontSize: '2rem',
        lineHeight: '90%',
    },
    'time-small': {
        fontSize: '3.9rem',
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
        fontSize: '2.7rem',
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
}));

function Widgets({ stickToBottom }) {
    const classes = useStyles();
    const theme = useTheme();
    const service = useBaseStateService();
    const appService = useAppService();
    const { widgets } = appService;
    const bookmarksService = useBookmarksService();
    const { height: heightRoot, ref: refRoot } = useResizeDetector();

    const onResize = useCallback((width, height) => {
        service.storage.temp.update({ desktopWidgetsHeight: height });
    }, []);

    const { height: heightWidget, ref: refWidget } = useResizeDetector({ onResize });
    const [state, setState] = useState(bookmarksService.settings.state);

    useEffect(() => {
        setState(bookmarksService.settings.state);
    }, [bookmarksService.settings.state]);

    if (BUILD === 'full' && state !== SERVICE_STATE.DONE) return null;

    let offset = 0;
    let positionOffset = '';

    if (BUILD === 'full') {
        if (
            (
                bookmarksService.fapIsDisplay
                && bookmarksService.settings.fapStyle === BKMS_FAP_STYLE.CONTAINED
            ) || appService.activity === ACTIVITY.FAVORITES
        ) {
            offset = 40 + theme.spacing(6) + theme.spacing(2.5);
        } else if (
            bookmarksService.fapIsDisplay
            && bookmarksService.settings.fapStyle === BKMS_FAP_STYLE.TRANSPARENT
        ) {
            offset = 40 + theme.spacing(6);
        } else if (
            bookmarksService.fapIsDisplay
            && bookmarksService.settings.fapStyle === BKMS_FAP_STYLE.PRODUCTIVITY
        ) {
            offset = 40 + theme.spacing(6);
        }

        if (
            (bookmarksService.fapIsDisplay
                && bookmarksService.settings.fapPosition === BKMS_FAP_POSITION.BOTTOM)
            || appService.activity === ACTIVITY.FAVORITES
        ) {
            positionOffset = 'bottom';
        } else if (bookmarksService.fapIsDisplay && bookmarksService.settings.fapPosition === BKMS_FAP_POSITION.TOP) {
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
            style={{ [positionOffset]: service.storage.temp.data.desktopFapHeight }}
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
                {(widgets.settings.dtwUseDate || widgets.settings.dtwUseWeather) && (
                    <Typography
                        className={clsx(
                            classes.row,
                            classes.text,
                            classes[`date-${widgets.settings.dtwSize.toLowerCase()}`],
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
        </Box>
    );
}

export default observer(Widgets);
