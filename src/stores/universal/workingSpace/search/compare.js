import { intersectionWith, isEqual } from 'lodash';
import FavoritesUniversalService from '../favorites';

const COMPARE = {
    FULL: 'FULL',
    PART: 'PART',
    INDIRECTLY: 'INDIRECTLY',
    NONE: 'NONE',
    IGNORE: 'IGNORE',
};

function compare(q, bookmark) {
    let folder;

    if (!q.folderId) {
        folder = COMPARE.IGNORE;
    } else if (bookmark.folderId === q.folderId) {
        folder = COMPARE.FULL;
    } else {
        return {
            tags: COMPARE.IGNORE,
            query: COMPARE.IGNORE,
            favCompare: COMPARE.IGNORE,
            folder: COMPARE.NONE,
            summary: COMPARE.NONE,
        };
    }

    let favCompare;

    if (!('onlyFavorites' in q._draftRequest) || !q.onlyFavorites) {
        favCompare = COMPARE.IGNORE;
    } else if (q.onlyFavorites && FavoritesUniversalService.findFavorite({
        itemType: 'bookmark',
        itemId: bookmark.id,
    })) {
        favCompare = COMPARE.FULL;
    } else {
        return {
            tags: COMPARE.IGNORE,
            query: COMPARE.IGNORE,
            favCompare: COMPARE.NONE,
            folder,
            summary: COMPARE.NONE,
        };
    }

    let tags;

    if (q.tags.length === 0) {
        tags = COMPARE.IGNORE;
    } else {
        const sameTagsCount = intersectionWith(q.tags, bookmark.tags, isEqual).length;
        if (sameTagsCount === bookmark.tags.length && sameTagsCount === q.tags.length && bookmark.tags.length !== 0) {
            tags = COMPARE.FULL;
        } else if (sameTagsCount !== 0 && sameTagsCount !== q.tags.length) {
            tags = COMPARE.INDIRECTLY;
        } else if (sameTagsCount !== 0 && bookmark.tags.length !== 0) {
            tags = COMPARE.PART;
        } else {
            tags = COMPARE.NONE;
        }
    }

    let query;

    if (q.query.length === 0) {
        query = COMPARE.IGNORE;
    } else {
        query = [bookmark.url, bookmark.name, bookmark.description]
            .map((bookmarkValue) => {
                if (bookmarkValue.toLowerCase() === q.query) {
                    return COMPARE.FULL;
                } else if (bookmarkValue.toLowerCase().indexOf(q.query) !== -1) {
                    return COMPARE.PART;
                } else {
                    return COMPARE.NONE;
                }
            });

        if (query.some((value) => value === COMPARE.FULL)) {
            query = COMPARE.FULL;
        } else if (query.some((value) => value === COMPARE.PART)) {
            query = COMPARE.PART;
        } else {
            query = COMPARE.NONE;
        }
    }

    let summary;

    if (
        (tags === COMPARE.IGNORE || tags === COMPARE.FULL)
        && (query === COMPARE.IGNORE || query === COMPARE.FULL)
        && (tags !== COMPARE.IGNORE || query !== COMPARE.IGNORE)
    ) {
        summary = COMPARE.FULL;
    } else if (
        tags === COMPARE.IGNORE && query === COMPARE.IGNORE
    ) {
        summary = COMPARE.FULL;
    } else if (
        ((tags === COMPARE.PART || tags === COMPARE.FULL) && (query === COMPARE.PART || query === COMPARE.FULL))
        || ((tags === COMPARE.PART || tags === COMPARE.FULL) && (query === COMPARE.IGNORE))
        || ((query === COMPARE.PART || query === COMPARE.FULL) && (tags === COMPARE.IGNORE))
    ) {
        summary = COMPARE.PART;
    } else if (
        (tags === COMPARE.IGNORE || tags === COMPARE.PART || tags === COMPARE.INDIRECTLY || tags === COMPARE.FULL)
        && (query === COMPARE.IGNORE || query === COMPARE.PART || query !== COMPARE.FULL)
        && (tags !== COMPARE.IGNORE || query !== COMPARE.IGNORE)
    ) {
        summary = COMPARE.INDIRECTLY;
    } else {
        summary = COMPARE.NONE;
    }

    return {
        tags,
        query,
        favCompare,
        folder,
        summary,
    };
}

export default compare;
export { COMPARE, compare };
