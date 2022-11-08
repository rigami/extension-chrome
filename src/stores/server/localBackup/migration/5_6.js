import { omit } from 'lodash';
import defaultSettings from '@/config/settings';

export default (backup) => ({
    meta: {
        date: backup.meta.date,
        appVersion: backup.meta.appVersion,
        appType: backup.meta.appType,
        version: 6,
    },
    storage: {
        wallpapersStreamQuery: {
            type: backup.settings.storage.backgroundStreamQuery.type,
            value: backup.settings.storage.backgroundStreamQuery.id.toLowerCase().replaceAll('_', '-'),
        },
        location: backup.settings.storage.location,
        weather: backup.settings.storage.weather,
        userName: backup.settings.storage.userName,
        bgCurrent: {
            angle: 0,
            antiAliasing: backup.settings.storage.bgCurrent.antiAliasing,
            author: backup.settings.storage.bgCurrent.author,
            authorAvatarSrc: backup.settings.storage.bgCurrent.authorAvatarSrc,
            authorName: backup.settings.storage.bgCurrent.authorName,
            colors: [],
            description: backup.settings.storage.bgCurrent.description,
            fullSrc: backup.settings.storage.bgCurrent.fullSrc,
            id: btoa(JSON.stringify({
                idInSource: backup.settings.storage.bgCurrent.originId,
                source: backup.settings.storage.bgCurrent.source.toLowerCase(),
            })),
            idInSource: backup.settings.storage.bgCurrent.originId,
            isDisliked: false,
            isLiked: backup.settings.storage.bgCurrent.isLiked,
            isLoad: backup.settings.storage.bgCurrent.isLoad,
            isSaved: backup.settings.storage.bgCurrent.isSaved,
            kind: 'media',
            previewSrc: backup.settings.storage.bgCurrent.previewSrc,
            source: backup.settings.storage.bgCurrent.source,
            sourceLink: backup.settings.storage.bgCurrent.sourceLink,
            type: backup.settings.storage.bgCurrent.type,
        },
    },
    settings: {
        'app.backdropTheme': backup.settings.app.backdropTheme,
        'app.theme': backup.settings.app.theme,
        'app.tabName': backup.settings.app.tabName,
        'app.defaultActivity': backup.settings.app.defaultActivity,
        'app.searchRunOnAnyKey': defaultSettings.app.searchRunOnAnyKey,
        'desktop.fapStyle': backup.settings.bookmarks.fapStyle,
        'desktop.fapPosition': backup.settings.bookmarks.fapPosition,
        'desktop.fapAlign': backup.settings.bookmarks.fapAlign || defaultSettings.desktop.fapAlign,
        'desktop.useWidgets': backup.settings.widgets.useWidgets,
        'desktop.widgetsPosition': backup.settings.widgets.dtwPosition,
        'desktop.widgetsSize': backup.settings.widgets.dtwSize,
        'wallpapers.changeInterval': backup.settings.backgrounds.changeInterval,
        'wallpapers.type': backup.settings.backgrounds.type,
        'wallpapers.kind': defaultSettings.wallpapers.kind,
        'wallpapers.dimmingPower': backup.settings.backgrounds.dimmingPower,
        'widgets.useDate': backup.settings.widgets.dtwUseDate,
        'widgets.dateAction': backup.settings.widgets.dtwDateAction,
        'widgets.useTime': backup.settings.widgets.dtwUseTime,
        'widgets.timeFormat12': defaultSettings.widgets.timeFormat12,
        'widgets.useWeather': backup.settings.widgets.dtwUseWeather,
        'widgets.weatherMetrics': backup.settings.widgets.dtwWeatherMetrics,
        'widgets.weatherAction': backup.settings.widgets.dtwWeatherAction,
        'workingSpace.displayVariant': defaultSettings.workingSpace.displayVariant,
        'workingSpace.sorting': defaultSettings.workingSpace.sorting,
    },
    workingSpace: {
        tags: backup.bookmarks.tags.map((tag) => omit(tag, ['color'])),
        folders: (() => {
            const flatFolders = [...backup.bookmarks.folders];

            let index = 0;

            while (index < flatFolders.length) {
                flatFolders.push(...flatFolders[index].children);
                flatFolders[index] = {
                    id: flatFolders[index].id,
                    name: flatFolders[index].name,
                    parentId: flatFolders[index].parentId || 0,
                };

                index += 1;
            }

            return flatFolders;
        })(),
        bookmarks: backup.bookmarks.bookmarks.map((bookmark) => ({
            id: bookmark.id,
            url: bookmark.url,
            name: bookmark.name,
            description: bookmark.description,
            icoVariant: bookmark.icoVariant,
            sourceIcoUrl: null,
            icoSafeZone: false,
            tags: bookmark.tags,
            folderId: bookmark.folderId,
            clickCounts: bookmark.clickCounts,
            createTimestamp: bookmark.createTimestamp,
            modifiedTimestamp: bookmark.modifiedTimestamp,
            imageBase64: bookmark.image,
        })),
        favorites: backup.bookmarks.favorites.map((tag) => omit(tag, ['id'])),
    },
    wallpapers: {
        all: backup.backgrounds.all.map((wallpaper) => ({
            angle: 0,
            antiAliasing: wallpaper.antiAliasing,
            author: wallpaper.author,
            authorAvatarSrc: wallpaper.authorAvatarSrc,
            authorName: wallpaper.authorName,
            colors: [],
            description: wallpaper.description,
            fullSrc: wallpaper.fullSrc || wallpaper.downloadLink,
            id: btoa(JSON.stringify({
                idInSource: wallpaper.originId,
                source: wallpaper.source.toLowerCase(),
            })),
            idInSource: wallpaper.originId,
            kind: 'media',
            previewSrc: wallpaper.previewSrc || wallpaper.previewLink,
            source: wallpaper.source,
            sourceLink: wallpaper.sourceLink,
            type: wallpaper.type,
        })),
    },
    wallpaperFiles: backup.wallpaperFiles,
    wallpaperPreviewFiles: backup.wallpaperPreviewFiles,
});
