import { action, makeAutoObservable } from 'mobx';
import StorageConnector from '@/utils/storageConnector';
import DBConnector from '@/utils/dbConnector';
import { cachingDecorator } from '@/utils/decorators';
import FSConnector from '@/utils/fsConnector';
import { DESTINATION } from '@/enum';
import Bookmark from '@/stores/bookmarks/entities/bookmark';
import Category from '@/stores/bookmarks/entities/category';
import { difference } from 'lodash';
import asyncAction from '@/utils/asyncAction';

class BookmarksStore {
    _coreService;
    _globalService;

    constructor(coreService, globalService) {
        makeAutoObservable(this);
        this._coreService = coreService;
        this._globalService = globalService;
    }

    @action('get bookmark')
    async get(bookmarkId) {
        console.log('get bookmark by id:', bookmarkId);
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

    @action('query bookmarks')
    async query(searchQuery = {}, notSaveSearch = true) {
        if (!notSaveSearch) {
            this._coreService.storage.updatePersistent({ bkmsLastSearch: searchQuery });
        }

        const query = {
            categories: {
                fullMatch: false,
                match: [],
                ...searchQuery.categories,
            },
            url: {
                fullMatch: false,
                match: '',
                ...searchQuery.url,
            },
            name: {
                fullMatch: false,
                match: '',
                ...searchQuery.name,
            },
            description: {
                fullMatch: false,
                match: '',
                ...searchQuery.description,
            },
        };

        console.log('query', query);

        const storesName = ['bookmarks_by_categories', 'bookmarks', 'categories'];
        const tx = DBConnector().transaction(storesName, 'readonly');
        const stores = {
            bookmarks_by_categories: tx.objectStore('bookmarks_by_categories'),
            bookmarks: tx.objectStore('bookmarks'),
            categories: tx.objectStore('categories'),
        };

        const getCategory = cachingDecorator((categoryId) => asyncAction(async () => {
            const category = await stores.categories.get(categoryId);
            return new Category(category);
        }));

        const checkQuery = (bookmark) => !(
            (
                query.categories.fullMatch
                && difference(query.categories.match, bookmark.categories).length !== 0
            )
            || (
                query.url.fullMatch
                && bookmark.url !== query.url.match
            )
            || (
                !query.url.fullMatch
                && bookmark.url.indexOf(query.url.match) === -1
            )
            || (
                query.name.fullMatch
                && bookmark.name !== query.name.match
            )
            || (
                !query.name.fullMatch
                && bookmark.name.indexOf(query.name.match) === -1
            )
            || (
                query.description.fullMatch
                && (bookmark.description || '') !== query.description.match
            )
            || (
                !query.description.fullMatch
                && ((bookmark.description || '').indexOf(query.description.match) === -1)
            )
        );

        const findBookmarks = {};
        const findCategories = {};
        const findBookmarksByCategories = {};
        const result = [];
        const bestMatches = [];
        const allBookmarks = [];

        if (query.categories.match.length === 0 && !query.categories.fullMatch) {
            const bookmarks = await stores.bookmarks.getAll();

            bookmarks.forEach((bookmark) => {
                findBookmarks[bookmark.id] = new Bookmark({
                    ...bookmark,
                    imageURL: FSConnector.getIconURL(bookmark.icoFileName),
                });
            });
        }

        let cursor = await stores.bookmarks_by_categories.openCursor();

        let cursorCategoryId;
        let cursorBookmarkId;

        while (cursor) {
            cursorCategoryId = cursor.value.categoryId;
            cursorBookmarkId = cursor.value.bookmarkId;

            if (
                (query.categories.match.length === 0 && !query.categories.fullMatch)
                || query.categories.match.indexOf(cursorCategoryId) !== -1
            ) {
                if (!findBookmarks[cursorBookmarkId]) {
                    findBookmarks[cursorBookmarkId] = await stores.bookmarks.get(cursorBookmarkId);
                    findBookmarks[cursorBookmarkId] = new Bookmark({
                        ...findBookmarks[cursorBookmarkId],
                        imageURL: FSConnector.getIconURL(findBookmarks[cursorBookmarkId].icoFileName),
                    });
                }
                if (!findCategories[cursorCategoryId]) {
                    findCategories[cursorCategoryId] = await getCategory(cursorCategoryId);
                }
                if (checkQuery(findBookmarks[cursorBookmarkId])) {
                    findBookmarksByCategories[cursorCategoryId] = [...(findBookmarksByCategories[cursorCategoryId] || []), findBookmarks[cursorBookmarkId]];
                }
            }
            cursor = await cursor.continue();
        }

        for (const bookmarkId in findBookmarks) {
            const index = stores.bookmarks_by_categories.index('bookmark_id');
            let score = 0;

            for await (const cursor of index.iterate(+bookmarkId)) {
                const category = await getCategory(cursor.value.categoryId);

                if (findCategories[category.id]) score += 1;

                findBookmarks[bookmarkId].categories = [...(findBookmarks[bookmarkId].categories || []), category];
            }

            if (checkQuery(findBookmarks[bookmarkId])) {
                if (score === query.categories.match.length) {
                    bestMatches.push(findBookmarks[bookmarkId]);
                }

                allBookmarks.push(findBookmarks[bookmarkId]);
            } else {
                delete findBookmarks[bookmarkId];
            }
        }

        await tx.done;

        if (
            query.categories.match.length !== 0
            || query.url.match !== ''
            || query.name.match !== ''
            || query.description.match !== ''
        ) {
            for (const categoryId in findCategories) {
                result.push({
                    category: findCategories[categoryId],
                    bookmarks: findBookmarksByCategories[categoryId],
                });
            }
        } else {
            result.unshift({
                category: {
                    id: 'all',
                    name: 'Все закладки',
                },
                bookmarks: allBookmarks,
            });
        }

        if (query.categories.match.length > 1 && result.length !== 0) {
            result.unshift({
                category: {
                    id: 'best',
                    name: 'Лучшие совпадения',
                },
                bookmarks: bestMatches,
            });
        }

        return result;
    }

    @action('save bookmarks')
    async save(props) {
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

        if (this._coreService) this._coreService.globalEventBus.call('bookmark/new', DESTINATION.APP, { bookmarkId: saveBookmarkId });

        return saveBookmarkId;
    }

    @action('remove bookmark')
    async remove(bookmarkId) {
        await this._globalService.removeFromFavorites({
            type: 'bookmark',
            id: bookmarkId,
        });

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

        if (this._coreService) this._coreService.globalEventBus.call('bookmark/remove', DESTINATION.APP, { bookmarkId });
    }
}

export default BookmarksStore;
