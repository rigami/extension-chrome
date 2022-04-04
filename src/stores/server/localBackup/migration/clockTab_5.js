import {
    ACTIVITY,
    BG_CHANGE_INTERVAL,
    BG_SELECT_MODE,
    BG_TYPE,
    BKMS_FAP_POSITION,
    BKMS_FAP_STYLE, BKMS_VARIANT,
    THEME,
} from '@/enum';
import Folder from '@/stores/universal/bookmarks/entities/folder';
import Bookmark from '@/stores/universal/bookmarks/entities/bookmark';
import Favorite from '@/stores/universal/bookmarks/entities/favorite';

const migrateSettings = (backup) => {
    const types = [BG_TYPE.ANIMATION];

    const randomSection = backup.settings.switching_background_in_special.random_selection;

    if (randomSection.type[0]) types.push(BG_TYPE.VIDEO);
    if (randomSection.type[1]) types.push(BG_TYPE.IMAGE);
    if (randomSection.type[2]) types.push(BG_TYPE.FILL_COLOR);

    let changeInterval = BG_CHANGE_INTERVAL.OPEN_TAB;

    if (backup.settings.switching_background_in_special.background_selection === 0) {
        changeInterval = Object.keys(BG_CHANGE_INTERVAL)[
            backup.settings.switching_background_in_special.random_selection.period >= 2
                ? backup.settings.switching_background_in_special.random_selection.period - 1
                : backup.settings.switching_background_in_special.random_selection.period
        ];
    }

    let fapStyle;

    if (!backup.settings.use_site_panel) {
        fapStyle = BKMS_FAP_STYLE.HIDDEN;
    } else if (!backup.settings.site_panel_substrate) {
        fapStyle = BKMS_FAP_STYLE.TRANSPARENT;
    } else {
        fapStyle = BKMS_FAP_STYLE.CONTAINED;
    }

    return {
        app: {
            backdropTheme: THEME.DARK,
            defaultActivity: backup.settings.open_site_panel_start
                ? ACTIVITY.BOOKMARKS
                : ACTIVITY.DESKTOP,
            searchRunOnAnyKey: true,
            theme: backup.settings.dark_theme ? THEME.DARK : THEME.LIGHT,
        },
        backgrounds: {
            dimmingPower: backup.settings.background_dimming_level * (100 / 3),
            kind: backup.settings.switching_background_in_special.background_selection === 0
                ? BG_SELECT_MODE.STREAM
                : BG_SELECT_MODE.SPECIFIC,
            changeInterval,
            type: types,
        },
        bookmarks: {
            fapPosition: backup.settings.site_panel_position === 1
                ? BKMS_FAP_POSITION.TOP
                : BKMS_FAP_POSITION.BOTTOM,
            fapStyle,
        },
    };
};

const migrationBookmarks = (backup) => {
    const bookmarks = [];
    const tags = [];
    const favorites = [];
    const folders = [];

    backup.sites.all.forEach((group) => {
        const folder = new Folder({
            id: folders.length + 2,
            name: group.name_group,
            parentId: 1,
        });
        folders.push(folder);

        group.sites.forEach((bookmark) => {
            const imageBase64 = bookmark.image && backup.sitesIcons
                ?.find(({ name }) => bookmark.image.indexOf(name) !== -1)?.file;

            bookmarks.push(
                new Bookmark({
                    id: bookmarks.length,
                    url: bookmark.url,
                    name: bookmark.name,
                    description: bookmark.description,
                    tags: [],
                    folderId: folder.id,
                    icoVariant: imageBase64 ? BKMS_VARIANT.SMALL : BKMS_VARIANT.SYMBOL,
                    imageBase64,
                }),
            );
        });
    });

    backup.sites.favorites.forEach((bookmark) => {
        let favBookmark = bookmarks.find(({ url }) => url === bookmark.url);

        if (!favBookmark) {
            const imageBase64 = bookmark.image && backup.sitesIcons
                ?.find(({ name }) => bookmark.image.indexOf(name) !== -1)?.file;

            favBookmark = new Bookmark({
                id: bookmarks.length,
                url: bookmark.url,
                name: bookmark.name,
                description: bookmark.description,
                folderId: 1,
                icoVariant: imageBase64 ? BKMS_VARIANT.SMALL : BKMS_VARIANT.SYMBOL,
                imageBase64,
            });

            bookmarks.push(favBookmark);
        }

        favorites.push(new Favorite({
            id: favorites.length,
            itemId: favBookmark.id,
            itemType: 'bookmark',
        }));
    });

    return {
        bookmarks,
        favorites,
        tags,
        folders,
    };
};

export default (backup) => {
    let settings = {};

    if (backup.typeData.settings) {
        settings = migrateSettings(backup.data);
    }

    let bookmarksData = {};

    if (backup.typeData.sites) {
        bookmarksData = migrationBookmarks(backup.data);
    }

    return {
        settings,
        bookmarks: bookmarksData,
        meta: {
            date: new Date(backup?.createTime).toISOString(),
            appVersion: 'ClockTab',
            appType: 'extension.chrome',
            version: 5,
        },
    };
};
