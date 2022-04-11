import {
    THEME,
    BG_CHANGE_INTERVAL,
    BG_TYPE,
    BG_SELECT_MODE,
    BKMS_FAP_STYLE,
    BKMS_FAP_POSITION,
    ACTIVITY,
    WIDGET_POSITION,
    WIDGET_SIZE,
    WIDGET_UNITS,
    BKMS_FAP_ALIGN,
    BKMS_DISPLAY_VARIANT,
    BKMS_SORTING,
} from '@/enum';

export default {
    wallpapers: {
        changeInterval: BG_CHANGE_INTERVAL.HOURS_1,
        type: [BG_TYPE.IMAGE, BG_TYPE.VIDEO],
        kind: BG_SELECT_MODE.STREAM,
        dimmingPower: 25,
    },
    desktop: {
        fapStyle: BKMS_FAP_STYLE.PRODUCTIVITY,
        fapPosition: BKMS_FAP_POSITION.BOTTOM,
        fapAlign: BKMS_FAP_ALIGN.LEFT,
        useWidgets: true,
        widgetsPosition: WIDGET_POSITION.LEFT_BOTTOM,
        widgetsSize: WIDGET_SIZE.SMALL,
    },
    workingSpace: {
        displayVariant: BKMS_DISPLAY_VARIANT.CARDS,
        sorting: BKMS_SORTING.BY_RELATIVE,
    },
    widgets: {
        useDate: true,
        dateDefaultAction: '',
        useTime: true,
        timeFormat12: false,
        useWeather: false,
        weatherMetrics: WIDGET_UNITS.CELSIUS,
        weatherDefaultAction: '',
    },
    app: {
        backdropTheme: THEME.DARK,
        theme: THEME.LIGHT,
        tabName: 'rigami',
        defaultActivity: ACTIVITY.BOOKMARKS,
        searchRunOnAnyKey: true,
    },
};
