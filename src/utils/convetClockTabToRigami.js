import {
    ACTIVITY,
    BG_CHANGE_INTERVAL,
    BG_SELECT_MODE,
    BG_TYPE,
    BKMS_FAP_POSITION,
    BKMS_FAP_STYLE,
    THEME,
} from '@/enum';
import Category from '@/stores/bookmarks/entities/category';
import Bookmark from '@/stores/bookmarks/entities/bookmark';

function convert(clockTabFile = {}) {
    console.log('clockTabFile', clockTabFile);

    const types = [BG_TYPE.ANIMATION];

    if (clockTabFile.data.settings.switching_background_in_special.random_selection.type[0]) types.push(BG_TYPE.VIDEO);
    if (clockTabFile.data.settings.switching_background_in_special.random_selection.type[1]) types.push(BG_TYPE.IMAGE);
    if (clockTabFile.data.settings.switching_background_in_special.random_selection.type[2]) types.push(BG_TYPE.FILL_COLOR);

    let changeInterval = BG_CHANGE_INTERVAL.OPEN_TAB;

    if (clockTabFile.data.settings.switching_background_in_special.background_selection === 0) {
        changeInterval = Object.keys(BG_CHANGE_INTERVAL)[
            clockTabFile.data.settings.switching_background_in_special.random_selection.period >= 2
                ? clockTabFile.data.settings.switching_background_in_special.random_selection.period - 1
                : clockTabFile.data.settings.switching_background_in_special.random_selection.period
        ];
    }

    const bookmarks = [];
    const categories = [];
    const favorites = [];

    clockTabFile.data.sites.all.forEach((group) => {
        const category = new Category({
            id: categories.length,
            name: group.name_group,
        });
        categories.push(category);

        group.sites.forEach((bookmark) => {
            bookmarks.push(
                new Bookmark({
                    id: bookmarks.length,
                    url: bookmark.url,
                    name: bookmark.name,
                    description: bookmark.description,
                    categories: [category.id],
                }),
            );
        });
    });

    clockTabFile.data.sites.favorites.forEach((bookmark) => {
        let favBookmark = bookmarks.find(({ url }) => url === bookmark.url);

        if (!favBookmark) {
            favBookmark = new Bookmark({
                id: bookmarks.length,
                url: bookmark.url,
                name: bookmark.name,
                description: bookmark.description,
            });

            bookmarks.push(favBookmark);
        }

        favorites.push({
            id: favBookmark.id,
            type: 'bookmark',
        });
    });

    return {
        settings: {
            app: {
                backdropTheme: THEME.DARK,
                defaultActivity: clockTabFile.data.settings.open_site_panel_start ? ACTIVITY.BOOKMARKS : ACTIVITY.DESKTOP,
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
                fapStyle: clockTabFile.data.settings.use_site_panel
                    ? BKMS_FAP_STYLE.HIDDEN
                    : clockTabFile.data.settings.site_panel_substrate
                        ? BKMS_FAP_STYLE.CONTAINED
                        : BKMS_FAP_STYLE.TRANSPARENT,
            },
        },
        bookmarks: {
            bookmarks,
            favorites,
            categories,
        },
        meta: {
            date: new Date(clockTabFile?.createTime).toISOString(),
            appVersion: 'ClockTab',
            appType: 'extension.chrome',
            version: 1,
        },
    };
}

export default convert;
