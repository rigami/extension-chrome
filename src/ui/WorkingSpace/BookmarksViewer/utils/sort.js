import { BKMS_SORTING } from '@/enum';

const checkIsFavorite = (workingSpaceService, favoriteCheckCache, bookmark) => {
    if (bookmark.id in favoriteCheckCache) return favoriteCheckCache[bookmark.id];

    const isFavorite = workingSpaceService.findFavorite({
        itemId: bookmark.id,
        itemType: 'bookmark',
    });

    favoriteCheckCache[bookmark.id] = isFavorite;

    return isFavorite;
};

const sortByRelative = (workingSpaceService) => (list) => {
    const favoriteCheckCache = {};

    return list.sort((bookmarkA, bookmarkB) => {
        const isFavoriteA = checkIsFavorite(workingSpaceService, favoriteCheckCache, bookmarkA);
        const isFavoriteB = checkIsFavorite(workingSpaceService, favoriteCheckCache, bookmarkB);

        if (isFavoriteA && !isFavoriteB) return -1;
        else if (!isFavoriteA && isFavoriteB) return 1;

        if (bookmarkA.name < bookmarkB.name) return -1;
        else if (bookmarkA.name > bookmarkB.name) return 1;

        return 0;
    });
};

const sortByNewest = () => (list) => list.sort((bookmarkA, bookmarkB) => {
    if (bookmarkA.createTimestamp > bookmarkB.createTimestamp) return -1;
    else if (bookmarkA.createTimestamp < bookmarkB.createTimestamp) return 1;

    return 0;
});

const sortByOldest = () => (list) => list.sort((bookmarkA, bookmarkB) => {
    if (bookmarkA.createTimestamp < bookmarkB.createTimestamp) return -1;
    else if (bookmarkA.createTimestamp > bookmarkB.createTimestamp) return 1;

    return 0;
});

const sorting = {
    [BKMS_SORTING.BY_RELATIVE]: sortByRelative,
    [BKMS_SORTING.OLDEST_FIRST]: sortByOldest,
    [BKMS_SORTING.NEWEST_FIRST]: sortByNewest,
};

export default sorting;
