import React from 'react';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import useAppStateService from '@/stores/app/AppStateProvider';
import DTW_SIZE from '@/enum/WIDGET/DTW_SIZE';
import { observer } from 'mobx-react-lite';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import { BKMS_FAP_POSITION, BKMS_FAP_STYLE } from '@/enum';
import clsx from 'clsx';
import DTW_POSITION from '@/enum/WIDGET/DTW_POSITION';
import WeatherWidget from '@/ui/Desktop/Widgets/Weather';
import { useTheme } from '@material-ui/styles';
import { toJS } from 'mobx';
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
    },
    widget: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    leftBottom: {
        alignItems: 'end',
        justifyContent: 'flex-end',
        '& $widget': { alignItems: 'end' },
    },
    leftMiddle: {
        alignItems: 'end',
        '& $widget': { alignItems: 'end' },
    },
    centerTop: { '& $widget': { marginBottom: '16%' } },
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
    const theme = useTheme();
    const { widgets } = useAppStateService();
    const bookmarksService = useBookmarksService();

    if (!bookmarksService.settings.isSync) return null;

    let offset = 0;
    let positionOffset = '';

    if (bookmarksService.fapIsDisplay && bookmarksService.settings.fapStyle === BKMS_FAP_STYLE.CONTAINED) {
        offset = 40 + theme.spacing(6) + theme.spacing(2.5);
    } else if (bookmarksService.fapIsDisplay && bookmarksService.settings.fapStyle === BKMS_FAP_STYLE.TRANSPARENT) {
        offset = 40 + theme.spacing(6);
    }

    if (bookmarksService.fapIsDisplay && bookmarksService.settings.fapPosition === BKMS_FAP_POSITION.BOTTOM) {
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
        >
            <Box className={classes.widget}>
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
        </Box>
    );
}

export default observer(Widgets);
