import {
    THEME,
    BG_CHANGE_INTERVAL,
    BG_TYPE,
    BG_SELECT_MODE,
    BKMS_FAP_STYLE,
    BKMS_FAP_POSITION,
    ACTIVITY,
    WIDGET_DTW_POSITION,
    WIDGET_DTW_SIZE,
    WIDGET_DTW_UNITS,
} from '@/enum';
import i18n from 'i18next';

export default {
    backgrounds: {
        changeInterval: BG_CHANGE_INTERVAL.HOURS_1,
        type: [
            BG_TYPE.IMAGE,
            BG_TYPE.VIDEO,
        ],
        selectionMethod: BG_SELECT_MODE.STREAM,
        dimmingPower: 25,
    },
    bookmarks: {
        fapStyle: BKMS_FAP_STYLE.CONTAINED,
        fapPosition: BKMS_FAP_POSITION.BOTTOM,
        openOnStartup: false,
        favorites: [],
        syncWithSystem: false,
        syncDefaultFolderName: 'google chrome'
    },
    widgets: {
        useWidgets: true,
        dtw: {
            position: WIDGET_DTW_POSITION.LEFT_BOTTOM,
            size: WIDGET_DTW_SIZE.MIDDLE,
            date: {
                useDate: true,
                defaultAction: '',
            },
            time: {
                useTime: true,
                format12: false,
            },
            weather: {
                useWeather: false,
                metrics: WIDGET_DTW_UNITS.CELSIUS,
                defaultAction: '',
            },
        },
    },
    app: {
        backdropTheme: THEME.DARK,
        theme: THEME.LIGHT,
        useSystemFont: true,
        tabName: i18n.t('tabName.default') || 'Rigami',
        defaultActivity: ACTIVITY.DESKTOP,
    },
};
