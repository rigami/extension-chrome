import React from 'react';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import useAppStateService from '@/stores/app/AppStateProvider';
import DTW_SIZE from '@/enum/WIDGET/DTW_SIZE';
import { observer } from 'mobx-react-lite';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import { BKMS_FAP_POSITION } from '@/enum';
import clsx from 'clsx';
import DTW_POSITION from '@/enum/WIDGET/DTW_POSITION';
import WeatherWidget from '@/ui/Desktop/Widgets/Weather';
import Time from './Time';
import Date from './Date';

const useStyles = makeStyles((theme) => ({
    root: {
        position: 'absolute',
        zIndex: 1,
        left: theme.spacing(11),
        bottom: theme.spacing(6),
        color: theme.palette.common.white,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'end',
        /* transition: theme.transitions.create(['bottom', 'top'], {
            easing: theme.transitions.easing.easeInOut,
            duration: theme.transitions.duration.standard,
        }), */
    },
    bottomOffset: { bottom: theme.spacing(6) + theme.spacing(8) },
    topOffset: {},
    leftMiddlePos: {
        top: 0,
        justifyContent: 'center',
    },
    centerTopPos: {
        bottom: 'auto',
        top: '30%',
        right: theme.spacing(11),
        alignItems: 'center',
        '&$bottomOffset': { top: '24%' },
        '&$topOffset': {
            top: 'auto',
            bottom: '24%',
        },
    },
    row: {
        display: 'flex',
        alignItems: 'center',
    },
    divider: {
        margin: theme.spacing(0, 2),
        backgroundColor: theme.palette.common.white,
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

function Widgets() {
    const classes = useStyles();
    const { widgets } = useAppStateService();
    const bookmarksService = useBookmarksService();

    return (
        <Box
            className={clsx(
                classes.root,
                bookmarksService.fapIsDisplay
              && bookmarksService.settings.fapPosition === BKMS_FAP_POSITION.BOTTOM
              && classes.bottomOffset,
                bookmarksService.fapIsDisplay
              && bookmarksService.settings.fapPosition === BKMS_FAP_POSITION.TOP
              && classes.topOffset,
                widgets.settings.dtwPosition === DTW_POSITION.LEFT_MIDDLE && classes.leftMiddlePos,
                widgets.settings.dtwPosition === DTW_POSITION.CENTER_TOP && classes.centerTopPos,
            )}
        >
            {widgets.settings.dtwUseTime && (
                <Time size={calcFontSize(widgets.settings.dtwSize, timeFontSize)} />
            )}
            {(widgets.settings.dtwUseDate || widgets.settings.dtwUseWeather) && (
                <Box className={classes.row}>
                    {widgets.settings.dtwUseDate && (
                        <Date
                            size={calcFontSize(widgets.settings.dtwSize, dateFontSize)}
                            dot={widgets.showWeather}
                        />
                    )}
                    {widgets.settings.dtwUseWeather && (
                        <WeatherWidget size={calcFontSize(widgets.settings.dtwSize, dateFontSize)} />
                    )}
                </Box>
            )}
        </Box>
    );
}

export default observer(Widgets);
