import { omit } from 'lodash';

export default (backup) => ({
    settings: {
        app: backup.settings.app,
        wallpapers: backup.settings.backgrounds,
        desktop: backup.settings.bookmarks,
    },
    bookmarks: backup.bookmarks.bookmarks,
    tags: backup.bookmarks.tags.map((tag) => omit(tag, ['color'])),
    folders: backup.bookmarks.folders,
    favorites: backup.bookmarks.favorites,
    meta: {
        ...backup.meta,
        version: 6,
    },
});
