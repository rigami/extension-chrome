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
    BKMS_FAP_ALIGN, BKMS_DISPLAY_VARIANT,
} from '@/enum';

export default {
    backgrounds: {
        changeInterval: BG_CHANGE_INTERVAL.HOURS_1,
        type: [BG_TYPE.IMAGE, BG_TYPE.VIDEO],
        kind: BG_SELECT_MODE.STREAM,
        dimmingPower: 25,
    },
    bookmarks: {
        fapStyle: BKMS_FAP_STYLE.PRODUCTIVITY,
        fapPosition: BKMS_FAP_POSITION.BOTTOM,
        fapAlign: BKMS_FAP_ALIGN.LEFT,
        openOnStartup: false,
        favorites: [],
        syncWithSystem: false,
        syncDefaultFolderName: 'google chrome',
        displayVariant: BKMS_DISPLAY_VARIANT.CARDS,
    },
    widgets: {
        useWidgets: true,
        dtw: {
            position: WIDGET_DTW_POSITION.LEFT_BOTTOM,
            size: WIDGET_DTW_SIZE.SMALL,
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
        tabName: 'rigami',
        defaultActivity: ACTIVITY.DESKTOP,
    },
};
