import {
    action, computed, makeAutoObservable, toJS,
} from 'mobx';
import DBConnector from '@/utils/dbConnector';
import { cachingDecorator } from '@/utils/decorators';
import FSConnector from '@/utils/fsConnector';
import Bookmark from '@/stores/universal/bookmarks/entities/bookmark';
import Category from '@/stores/universal/bookmarks/entities/category';
import { difference, values } from 'lodash';
import asyncAction from '@/utils/asyncAction';
import FavoritesUniversalService from '@/stores/universal/bookmarks/favorites';

export const COMPARE = {
    FULL: 'FULL',
    PART: 'PART',
    NONE: 'NONE',
    IGNORE: 'IGNORE',
};

class BookmarksUniversalService {
    @action('get bookmark')
    static async get(bookmarkId) {
        // console.log('get bookmark by id:', bookmarkId);
        const bookmark = await DBConnector().get('bookmarks', bookmarkId);

        const storesName = ['bookmarks_by_categories', 'categories'];
        const tx = DBConnector().transaction(storesName, 'readonly');
        const stores = {
            bookmarks_by_categories: tx.objectStore('bookmarks_by_categories'),
            categories: tx.objectStore('categories'),
        };

        const getCategory = (categoryId) => asyncAction(async () => {
            const category = await stores.categories.get(categoryId);
            return new Category(category);
        });

        const findCategories = [];

        let cursor = await stores.bookmarks_by_categories.openCursor();

        let cursorCategoryId;
        let cursorBookmarkId;

        while (cursor) {
            cursorCategoryId = cursor.value.categoryId;
            cursorBookmarkId = cursor.value.bookmarkId;

            if (cursorBookmarkId === bookmark.id) {
                const category = await getCategory(cursorCategoryId);
                findCategories.push(category);
            }
            cursor = await cursor.continue();
        }

        return new Bookmark({
            ...bookmark,
            categories: findCategories,
        });
    }

    @action('query feature bookmarks')
    static async getAllInFolder(folderId) {
        const bookmarksKeys = await DBConnector().getAllFromIndex(
            'bookmarks',
            'folder_id',
            folderId,
        );

        return Promise.all(bookmarksKeys.map(({ id }) => this.get(id)));
    }

    @action('query bookmarks')
    static async query(searchRequest = null) {
        const bestMatches = {};
        const allMatches = {};

        console.log('DBConnector():', DBConnector());

        let bookmarksKeys;

        if (searchRequest.folderId) {
            bookmarksKeys = await DBConnector().getAllFromIndex(
                'bookmarks',
                'folder_id',
                searchRequest.folderId,
            );
        } else {
            bookmarksKeys = await DBConnector().getAll('bookmarks');
        }

        const bookmarks = await Promise.all(bookmarksKeys.map(({ id }) => this.get(id)));

        bookmarks.forEach((bookmark) => {
            const compare = searchRequest.compare(bookmark);

            if (searchRequest.folderId && compare.folder === COMPARE.NONE) return;

            if (compare.summary === COMPARE.FULL) {
                bestMatches[bookmark.id] = bookmark;
                allMatches[bookmark.id] = bookmark;
            } else if (compare.summary === COMPARE.PART) {
                allMatches[bookmark.id] = bookmark;
            }
        });

        const { usedFields } = searchRequest;

        return {
            best: usedFields.query || usedFields.tags ? values(bestMatches) : null,
            all: values(allMatches),
        };
    }

    @action('save bookmarks')
    static async save(props, pushEvent = true) {
        const {
            url,
            name,
            description,
            imageURL,
            imageBase64,
            categories = [],
            folderId,
            icoVariant,
            id,
        } = props;

        console.log('Save bookmark', props);

        const saveData = {
            url,
            name: name.trim(),
            description: description && description.trim(),
            icoVariant,
            folderId,
        };

        let saveBookmarkId;
        let icoName = `${Date.now().toString()}`;
        let oldCategories = [];

        if (id) {
            const oldBookmark = await this.get(id);
            oldCategories = oldBookmark.categories.map((category) => category.id);

            icoName = oldBookmark.icoFileName || icoName;

            saveBookmarkId = await DBConnector().put('bookmarks', {
                id,
                ...saveData,
                icoFileName: oldBookmark.icoFileName,
            });
        } else {
            try {
                saveBookmarkId = await DBConnector().add('bookmarks', {
                    ...saveData,
                    icoFileName: icoName,
                });
            } catch (e) {
                throw new Error('Similar bookmark already exist');
            }
        }

        const categoriesNow = await DBConnector().getAllFromIndex(
            'bookmarks_by_categories',
            'bookmark_id',
            saveBookmarkId,
        );

        await Promise.all(
            categoriesNow.map(({ categoryId, id: bindId }) => {
                if (~categories.indexOf(categoryId)) return Promise.resolve();

                return DBConnector().delete('bookmarks_by_categories', bindId);
            }),
        );

        await Promise.all(
            categories.map((categoryId) => {
                if (~oldCategories.indexOf(categoryId)) return Promise.resolve();

                return DBConnector().add('bookmarks_by_categories', {
                    categoryId,
                    bookmarkId: saveBookmarkId,
                });
            }),
        );

        if (imageBase64 || (imageURL && imageURL.substring(0, 11) !== 'filesystem:')) {
            let blob;

            if (imageBase64) {
                const base64Response = await fetch(imageBase64);
                blob = await base64Response.blob();
            } else {
                const img = await new Promise((resolve, reject) => {
                    const imgLoad = document.createElement('img');
                    imgLoad.crossOrigin = 'anonymous';
                    imgLoad.src = imageURL;

                    imgLoad.onload = () => resolve(imgLoad);
                    imgLoad.onerror = reject;
                });

                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;

                const context = canvas.getContext('2d');

                context.drawImage(img, 0, 0);

                blob = await new Promise((resolve) => {
                    canvas.toBlob(resolve, 'image/png');
                });
            }

            await FSConnector.saveFile('/bookmarksIcons', blob, icoName);
        } else if (!imageURL && id) {
            try {
                await FSConnector.removeFile('/bookmarksIcons', icoName);
            } catch (e) {
                console.error(e);
            }
        }

        return saveBookmarkId;
    }

    @action('remove bookmark')
    static async remove(bookmarkId) {
        const favoriteItem = FavoritesUniversalService.findFavorite({
            itemType: 'bookmark',
            itemId: bookmarkId,
        });

        if (favoriteItem) {
            await FavoritesUniversalService.removeFromFavorites(favoriteItem.id);
        }

        const oldBookmark = await DBConnector().get('bookmarks', bookmarkId);
        await DBConnector().delete('bookmarks', bookmarkId);

        const removeBinds = await DBConnector().getAllFromIndex(
            'bookmarks_by_categories',
            'bookmark_id',
            bookmarkId,
        );

        await Promise.all(removeBinds.map(({ id }) => DBConnector().delete('bookmarks_by_categories', id)));

        try {
            await FSConnector.removeFile('/bookmarksIcons', oldBookmark.icoFileName);
        } catch (e) {
            console.log('Failed remove bookmark icon', e);
        }
    }
}

export class SearchQuery {
    tags = [];
    folderId = null;
    query = '';

    constructor(request) {
        if ('tags' in request) this.tags = request.tags;
        if ('folderId' in request) this.folderId = request.folderId;
        if ('query' in request) this.query = request.query.toLowerCase();
    }

    @computed
    get searchEverywhere() {
        return !this.folderId;
    }

    @computed
    get usedFields() {
        return {
            tags: this.tags.length !== 0,
            folder: !!this.folderId,
            query: this.query.length !== 0,
        };
    }

    compare(bookmark) {
        let tags;

        const sameTagsCount = difference(this.tags, bookmark.categories.map(({ id }) => id)).length;
        if (this.tags.length === 0) {
            tags = COMPARE.IGNORE;
        } else if (sameTagsCount === 0 && bookmark.categories.length !== 0) {
            tags = COMPARE.FULL;
        } else if (sameTagsCount !== bookmark.categories.length && bookmark.categories.length !== 0) {
            tags = COMPARE.PART;
        } else {
            tags = COMPARE.NONE;
        }

        let query;

        if (this.query.length === 0) {
            query = COMPARE.IGNORE;
        } else {
            query = [bookmark.url, bookmark.name, bookmark.description]
                .map((bookmarkValue) => {
                    if (bookmarkValue.toLowerCase() === this.query) {
                        return COMPARE.FULL;
                    } else if (bookmarkValue.toLowerCase().indexOf(this.query) !== -1) {
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

        let folder;

        if (!this.folderId) {
            folder = COMPARE.IGNORE;
        } else if (bookmark.folderId === this.folderId) {
            folder = COMPARE.FULL;
        } else {
            folder = COMPARE.NONE;
        }

        let summary;

        if (folder !== COMPARE.IGNORE && folder === COMPARE.NONE) {
            summary = COMPARE.NONE;
        } else if (
            (tags === COMPARE.IGNORE || tags === COMPARE.FULL)
            && (query === COMPARE.IGNORE || query === COMPARE.FULL)
            && (tags !== COMPARE.IGNORE || query !== COMPARE.IGNORE)
        ) {
            summary = COMPARE.FULL;
        } else if (
            (tags !== COMPARE.IGNORE && tags !== COMPARE.NONE)
            || (query !== COMPARE.IGNORE && query !== COMPARE.NONE)
            || (query === COMPARE.IGNORE && tags === COMPARE.IGNORE)
        ) {
            summary = COMPARE.PART;
        } else {
            summary = COMPARE.NONE;
        }

        return {
            tags,
            query,
            folder,
            summary,
        };
    }
}

export default BookmarksUniversalService;
