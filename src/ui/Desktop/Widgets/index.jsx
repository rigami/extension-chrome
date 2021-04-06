import React from 'react';
import { Box, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import DTW_SIZE from '@/enum/WIDGET/DTW_SIZE';
import { observer } from 'mobx-react-lite';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import { ACTIVITY, BKMS_FAP_POSITION, BKMS_FAP_STYLE } from '@/enum';
import clsx from 'clsx';
import DTW_POSITION from '@/enum/WIDGET/DTW_POSITION';
import WeatherWidget from '@/ui/Desktop/Widgets/Weather';
import { useTheme } from '@material-ui/styles';
import { useResizeDetector } from 'react-resize-detector';
import useAppService from '@/stores/app/AppStateProvider';
import Time from './Time';
import Date from './Date';

const useStyles = makeStyles((theme) => ({
    root: {
        position: 'absolute',
        zIndex: 1,
        top: theme.spacing(3),
        right: theme.spacing(11),
        bottom: theme.spacing(3),
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
        alignItems: 'end',
        justifyContent: 'flex-end',
        '& $widget': {
            alignItems: 'end',
            transformOrigin: 'left bottom',
        },
    },
    leftMiddle: {
        alignItems: 'end',
        '& $widget': {
            alignItems: 'end',
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
}));

const timeFontSize = ['h4', 'h2', 'h1'];
const dateFontSize = ['h5', 'h3', 'h2'];

const calcFontSize = (size, dict) => {
    const [small, middle, big] = dict;

    if (size === DTW_SIZE.BIG) {
        return big;
    } else if (size === DTW_SIZE.MIDDLE) {
        return middle;
    }

    return small;
};

function Widgets({ stickToBottom }) {
    const classes = useStyles();
    const theme = useTheme();
    const appService = useAppService();
    const { widgets } = appService;
    const bookmarksService = useBookmarksService();
    const { height: heightRoot, ref: refRoot } = useResizeDetector();
    const { height: heightWidget, ref: refWidget } = useResizeDetector();

    if (!bookmarksService.settings.isSync) return null;

    let offset = 0;
    let positionOffset = '';

    if (
        (bookmarksService.fapIsDisplay
        && bookmarksService.settings.fapStyle === BKMS_FAP_STYLE.CONTAINED)
        || appService.activity === ACTIVITY.FAVORITES
    ) {
        offset = 40 + theme.spacing(6) + theme.spacing(2.5);
    } else if (bookmarksService.fapIsDisplay && bookmarksService.settings.fapStyle === BKMS_FAP_STYLE.TRANSPARENT) {
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

    return (
        <Box
            className={clsx(
                classes.root,
                widgets.settings.dtwPosition === DTW_POSITION.LEFT_BOTTOM && classes.leftBottom,
                widgets.settings.dtwPosition === DTW_POSITION.LEFT_MIDDLE && classes.leftMiddle,
                widgets.settings.dtwPosition === DTW_POSITION.CENTER_TOP && classes.centerTop,
            )}
            style={{ [positionOffset]: offset }}
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
                        variant={calcFontSize(widgets.settings.dtwSize, timeFontSize)}
                        className={classes.text}
                    >
                        <Time />
                    </Typography>
                )}
                {(widgets.settings.dtwUseDate || widgets.settings.dtwUseWeather) && (
                    <Typography
                        variant={calcFontSize(widgets.settings.dtwSize, timeFontSize)}
                        className={clsx(classes.row, classes.text)}
                    >
                        {widgets.settings.dtwUseDate && (
                            <Date
                                size={calcFontSize(widgets.settings.dtwSize, dateFontSize)}
                                dot={widgets.showWeather}
                            />
                        )}
                        {widgets.settings.dtwUseWeather && (
                            <WeatherWidget size={calcFontSize(widgets.settings.dtwSize, dateFontSize)} />
                        )}
                    </Typography>
                )}
            </Box>
        </Box>
    );
}

export default observer(Widgets);
