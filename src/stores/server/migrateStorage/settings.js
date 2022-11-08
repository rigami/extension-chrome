import { toJS } from 'mobx';
import StorageConnector from '@/stores/universal/storage/connector';
import { BG_SELECT_MODE, BKMS_DISPLAY_VARIANT, BKMS_SORTING, BG_CHANGE_INTERVAL } from '@/enum';

// eslint-disable-next-line camelcase
async function migrate_1_2(settings) {
    return {
        'app.backdropTheme': settings.app.backdropTheme,
        'app.defaultActivity': settings.app.defaultActivity,
        'app.searchRunOnAnyKey': true,
        'app.tabName': settings.app.tabName,
        'app.theme': settings.app.theme,
        'desktop.fapAlign': settings.bookmarks.fapAlign,
        'desktop.fapPosition': settings.bookmarks.fapPosition,
        'desktop.fapStyle': settings.bookmarks.fapStyle,
        'desktop.useWidgets': settings.widgets.useWidgets,
        'desktop.widgetsPosition': settings.widgets.dtwPosition,
        'desktop.widgetsSize': settings.widgets.dtwSize,
        'wallpapers.changeInterval': settings.backgrounds.selectionMethod === 'SPECIFIC'
            ? BG_CHANGE_INTERVAL.NEVER
            : settings.backgrounds.changeInterval,
        'wallpapers.dimmingPower': settings.backgrounds.dimmingPower,
        'wallpapers.kind': BG_SELECT_MODE.STREAM,
        'wallpapers.type': settings.backgrounds.type,
        'widgets.dateAction': settings.widgets.dtwDateAction,
        'widgets.timeFormat12': settings.widgets.dtwTimeFormat12,
        'widgets.useDate': settings.widgets.dtwUseDate,
        'widgets.useTime': settings.widgets.dtwUseTime,
        'widgets.useWeather': settings.widgets.dtwUseWeather,
        'widgets.weatherAction': settings.widgets.dtwWeatherAction,
        'widgets.weatherMetrics': settings.widgets.dtwWeatherMetrics,
        'workingSpace.displayVariant': BKMS_DISPLAY_VARIANT.CARDS,
        'workingSpace.sorting': BKMS_SORTING.BY_RELATIVE,
    };
}

async function migrate(storage, oldVersion, newVersion) {
    let migratedStorage = oldVersion !== 0 && oldVersion < 2 ? await StorageConnector.get() : toJS(storage.data);
    console.log('Migrate settings:', storage, oldVersion, newVersion, migratedStorage);

    if (oldVersion !== 0 && oldVersion < 2) migratedStorage = await migrate_1_2(migratedStorage);

    await storage.updateRaw(migratedStorage, false, true);
}

export default migrate;
