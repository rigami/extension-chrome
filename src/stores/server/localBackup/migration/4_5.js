import { omit } from 'lodash';

export default (backup) => ({
    meta: {
        date: backup.meta.date,
        appVersion: backup.meta.appVersion,
        appType: backup.meta.appType,
        version: 5,
    },
    settings: {
        app: backup.settings.app,
        backgrounds: backup.settings.backgrounds,
        bookmarks: backup.settings.bookmarks,
        widgets: backup.settings.widgets,
    },
    bookmarks: {
        bookmarks: backup.bookmarks.bookmarks,
        tags: backup.bookmarks.tags.map((tag) => omit(tag, ['color'])),
        folders: backup.bookmarks.folders,
        favorites: backup.bookmarks.favorites,
    },
    backgrounds: { all: backup.backgrounds.all },
    wallpaperFiles: backup.wallpaperFiles,
    wallpaperPreviewFiles: backup.wallpaperPreviewFiles,
});
