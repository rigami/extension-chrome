import { values } from 'lodash';
import SearchQuery from './searchQuery';
import { compare, COMPARE } from './compare';
import db from '@/utils/db';
import Bookmark from '../entities/bookmark';

async function search(searchRequest = new SearchQuery()) {
    const bestMatches = {};
    const partMatches = {};
    const indirectlyMatches = {};
    const allMatches = {};

    console.log('[search] searchRequest', searchRequest);

    console.time('query');

    let allBookmarks;

    if (searchRequest.folderId) {
        allBookmarks = await db().getAllFromIndex('bookmarks', 'folder_id', searchRequest.folderId);
    } else {
        allBookmarks = await db().getAll('bookmarks');
    }

    const allTags = {};

    (await db().getAll('tags')).forEach((tag) => {
        allTags[tag.id] = tag;
    });

    allBookmarks.forEach((bookmark) => {
        const compareResult = compare(searchRequest, bookmark);

        console.log(`[search] folderId:${searchRequest.folderId} compare:${compareResult.folder}`);

        if (searchRequest.folderId && compareResult.folder === COMPARE.NONE) return;

        if (compareResult.summary === COMPARE.FULL) {
            const entity = new Bookmark({
                ...bookmark,
                tagsFull: bookmark.tags.map((tagId) => allTags[tagId]),
            });

            bestMatches[bookmark.id] = entity;
            allMatches[bookmark.id] = entity;
        } else if (compareResult.summary === COMPARE.PART) {
            allMatches[bookmark.id] = new Bookmark({
                ...bookmark,
                tagsFull: bookmark.tags.map((tagId) => allTags[tagId]),
            });

            partMatches[bookmark.id] = allMatches[bookmark.id];
        } else if (compareResult.summary === COMPARE.INDIRECTLY) {
            allMatches[bookmark.id] = new Bookmark({
                ...bookmark,
                tagsFull: bookmark.tags.map((tagId) => allTags[tagId]),
            });

            indirectlyMatches[bookmark.id] = allMatches[bookmark.id];
        }
    });
    console.timeEnd('query');

    return {
        best: values(bestMatches),
        part: values(partMatches),
        indirectly: values(indirectlyMatches),
        all: values(allMatches),
    };
}

export { search, SearchQuery };
