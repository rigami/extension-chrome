import {
    ACTIVITY,
    BG_CHANGE_INTERVAL,
    BG_SELECT_MODE,
    BG_TYPE,
    BKMS_FAP_POSITION,
    BKMS_FAP_STYLE, BKMS_VARIANT,
    THEME,
} from '@/enum';
import Bookmark from '@/stores/universal/bookmarks/entities/bookmark';
import Folder from '@/stores/universal/bookmarks/entities/folder';
import Favorite from '@/stores/universal/bookmarks/entities/favorite';

function convert(clockTabFile = {}) {
    console.log('clockTabFile', clockTabFile);

    let settings = {};

    if (clockTabFile.typeData.settings) {
        const types = [BG_TYPE.ANIMATION];

        const randomSection = clockTabFile.data.settings.switching_background_in_special.random_selection;

        if (randomSection.type[0]) types.push(BG_TYPE.VIDEO);
        if (randomSection.type[1]) types.push(BG_TYPE.IMAGE);
        if (randomSection.type[2]) types.push(BG_TYPE.FILL_COLOR);

        let changeInterval = BG_CHANGE_INTERVAL.OPEN_TAB;

        if (clockTabFile.data.settings.switching_background_in_special.background_selection === 0) {
            changeInterval = Object.keys(BG_CHANGE_INTERVAL)[
                clockTabFile.data.settings.switching_background_in_special.random_selection.period >= 2
                    ? clockTabFile.data.settings.switching_background_in_special.random_selection.period - 1
                    : clockTabFile.data.settings.switching_background_in_special.random_selection.period
            ];
        }

        let fapStyle;

        if (!clockTabFile.data.settings.use_site_panel) {
            fapStyle = BKMS_FAP_STYLE.HIDDEN;
        } else if (!clockTabFile.data.settings.site_panel_substrate) {
            fapStyle = BKMS_FAP_STYLE.TRANSPARENT;
        } else {
            fapStyle = BKMS_FAP_STYLE.CONTAINED;
        }

        settings = {
            app: {
                backdropTheme: THEME.DARK,
                defaultActivity: clockTabFile.data.settings.open_site_panel_start
                    ? ACTIVITY.BOOKMARKS
                    : ACTIVITY.DESKTOP,
                theme: clockTabFile.data.settings.dark_theme ? THEME.DARK : THEME.LIGHT,
            },
            backgrounds: {
                dimmingPower: clockTabFile.data.settings.background_dimming_level * (100 / 3),
                selectionMethod: clockTabFile.data.settings.switching_background_in_special.background_selection === 0
                    ? BG_SELECT_MODE.RANDOM
                    : BG_SELECT_MODE.SPECIFIC,
                changeInterval,
                type: types,
            },
            bookmarks: {
                fapPosition: clockTabFile.data.settings.site_panel_position === 1
                    ? BKMS_FAP_POSITION.TOP
                    : BKMS_FAP_POSITION.BOTTOM,
                fapStyle,
            },
        };
    }

    let bookmarksData = {};

    if (clockTabFile.typeData.sites) {
        const bookmarks = [];
        const categories = [];
        const favorites = [];
        const folders = [];

        clockTabFile.data.sites.all.forEach((group) => {
            const folder = new Folder({
                id: folders.length + 2,
                name: group.name_group,
                parentId: 1,
            });
            folders.push(folder);

            group.sites.forEach((bookmark) => {
                const imageBase64 = bookmark.image && clockTabFile.data.sitesIcons
                    ?.find(({ name }) => bookmark.image.indexOf(name) !== -1)?.file;

                bookmarks.push(
                    new Bookmark({
                        id: bookmarks.length,
                        url: bookmark.url,
                        name: bookmark.name,
                        description: bookmark.description,
                        categories: [],
                        folderId: folder.id,
                        icoVariant: imageBase64 ? BKMS_VARIANT.SMALL : BKMS_VARIANT.SYMBOL,
                        imageBase64,
                    }),
                );
            });
        });

        clockTabFile.data.sites.favorites.forEach((bookmark) => {
            let favBookmark = bookmarks.find(({ url }) => url === bookmark.url);

            if (!favBookmark) {
                const imageBase64 = bookmark.image && clockTabFile.data.sitesIcons
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

        bookmarksData = {
            bookmarks,
            favorites,
            categories,
            folders,
        };

        console.log('bookmarksData:', bookmarksData);
    }

    return {
        settings,
        bookmarks: bookmarksData,
        meta: {
            date: new Date(clockTabFile?.createTime).toISOString(),
            appVersion: 'ClockTab',
            appType: 'extension.chrome',
            version: 1,
        },
    };
}

export default convert;
