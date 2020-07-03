import { action, observable } from 'mobx';
import StorageConnector from '@/utils/storageConnector';
import DBConnector from '@/utils/dbConnector';
import { cachingDecorator } from '@/utils/decorators';
import EventBus from '@/utils/eventBus';
import getUniqueColor from "@/utils/uniqueColor";
import FSConnector from "@/utils/fsConnector";

class BookmarksStore {
    @observable fapStyle;
    @observable fapPosition;
    @observable openOnStartup;
    @observable categories = [];
    @observable lastSearch = null;
    @observable lastTruthSearchTimestamp = null;
    @observable favorites = [];
    eventBus;

    constructor() {
        this.eventBus = new EventBus();

        StorageConnector.getItem('bkms_fap_style')
            .then((value) => { this.fapStyle = value; })
            .catch((e) => console.error(e));

        StorageConnector.getItem('bkms_fap_position')
            .then((value) => { this.fapPosition = value; })
            .catch((e) => console.error(e));

        StorageConnector.getItem('bkms_open_on_startup')
            .then((value) => { this.openOnStartup = value; })
            .catch((e) => console.error(e));

        StorageConnector.getJSONItem('bkms_last_search')
            .then((value) => { this.lastSearch = value; });

        this._syncCategories()
            .then(() => StorageConnector.getJSONItem('bkms_favorites')
                .then((value) => { this.favorites = value; })
                .catch((e) => console.error(e)));
    }

    @action('set fast access panel style')
    setFAPStyle(style) {
        this.fapStyle = style;

        return StorageConnector.setItem('bkms_fap_style', style);
    }

    @action('set fast access panel position')
    setFAPPosition(position) {
        this.fapPosition = position;

        return StorageConnector.setItem('bkms_fap_position', position);
    }

    @action('set open on startup')
    setOpenOnStartup(position) {
        this.openOnStartup = position;

        return StorageConnector.setItem('bkms_open_on_startup', position);
    }

    @action('sync categories with db')
    _syncCategories() {
        return DBConnector().getAll('categories')
            .then((value) => { this.categories = value; });
    }

    @action('get category by id')
    getCategory(categoryId) {
        return this.categories.find(({ id }) => id === categoryId);
    }

    @action('save category')
    async saveCategory(name, categoryId, userColor) {
        let color;
        if (!categoryId) {
            const countCategories = await DBConnector().count('categories')
            color = userColor || getUniqueColor(countCategories);
        } else {
            color = userColor || this.getCategory(categoryId).color;
        }

        const similarCategory = await DBConnector().getFromIndex('categories', 'name', name);

        if (similarCategory && similarCategory.id !== categoryId) {
            throw new Error("category_already_exist");
        }

        let newCategoryId = categoryId;

        if (categoryId) {
            await DBConnector().put('categories', {
                id: categoryId,
                name: name.trim(),
                color,
            });
        } else {
            newCategoryId = await DBConnector().add('categories', {
                name: name.trim(),
                color,
            });
        }

        this._syncCategories();

        return newCategoryId;
    }

    @action('remove category')
    async removeCategory(categoryId) {
        await DBConnector().delete('categories', categoryId);

        const removeBinds = await DBConnector().getAllFromIndex(
            'bookmarks_by_categories',
            'category_id',
            categoryId
        );

        await Promise.all(removeBinds.map(({ id }) => DBConnector().delete('bookmarks_by_categories', id)));

        this._syncCategories();
        this.lastTruthSearchTimestamp = Date.now();
    }

    @action('get bookmark')
    async getBookmark(bookmarkId) {
        const bookmark = await DBConnector().get('bookmarks', bookmarkId);

        const storesName = ['bookmarks_by_categories', 'categories'];
        const tx = DBConnector().transaction(storesName, 'readonly');
        const stores = {
            bookmarks_by_categories: tx.objectStore('bookmarks_by_categories'),
            categories: tx.objectStore('categories'),
        };

        const getCategory = (categoryId) => stores.categories.get(categoryId);

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

        bookmark.categories = findCategories;
        bookmark.imageUrl = FSConnector.getIconURL(bookmark.icoFileName);

        return bookmark;
    }

    @action('search bookmarks')
    async search(searchQuery = {}, notSaveSearch = false) {
        if (!notSaveSearch) {
            this.lastSearch = searchQuery;
            this.lastTruthSearchTimestamp = Date.now();

            await StorageConnector.setJSONItem('bkms_last_search', searchQuery);
        }

        const { categories = [] } = searchQuery;

        const storesName = ['bookmarks_by_categories', 'bookmarks', 'categories'];
        const tx = DBConnector().transaction(storesName, 'readonly');
        const stores = {
            bookmarks_by_categories: tx.objectStore('bookmarks_by_categories'),
            bookmarks: tx.objectStore('bookmarks'),
            categories: tx.objectStore('categories'),
        };

        const getCategory = cachingDecorator((categoryId) => stores.categories.get(categoryId));

        const findBookmarks = {};
        const findCategories = {};
        const findBookmarksByCategories = {};
        const result = [];
        const bestMatches = [];
        const allBookmarks = [];

        if (categories.length === 0) {
            const bookmarks = await stores.bookmarks.getAll();

            bookmarks.forEach((bookmark) => {
                findBookmarks[bookmark.id] = {
                    ...bookmark,
                    imageUrl: FSConnector.getIconURL(bookmark.icoFileName),
                };
            });
        }

        let cursor = await stores.bookmarks_by_categories.openCursor();

        let cursorCategoryId;
        let cursorBookmarkId;

        while (cursor) {
            cursorCategoryId = cursor.value.categoryId;
            cursorBookmarkId = cursor.value.bookmarkId;

            if (categories.length === 0 || ~categories.indexOf(cursorCategoryId)) {
                if (!findBookmarks[cursorBookmarkId]) {
                    findBookmarks[cursorBookmarkId] = await stores.bookmarks.get(cursorBookmarkId);
                    findBookmarks[cursorBookmarkId] = {
                        ...findBookmarks[cursorBookmarkId],
                        imageUrl: FSConnector.getIconURL(findBookmarks[cursorBookmarkId].icoFileName),
                    };
                }
                if (!findCategories[cursorCategoryId]) {
                    findCategories[cursorCategoryId] = await getCategory(cursorCategoryId);
                }
                findBookmarksByCategories[cursorCategoryId] = [...(findBookmarksByCategories[cursorCategoryId] || []), findBookmarks[cursorBookmarkId]];
            }
            cursor = await cursor.continue();
        }

        for (const bookmarkId in findBookmarks) {
            const index = stores.bookmarks_by_categories.index('bookmark_id');
            let score = 0;

            for await (const cursor of index.iterate(+bookmarkId)) {
                const category = await getCategory(cursor.value.categoryId);

                if (findCategories[category.id]) score++;

                findBookmarks[bookmarkId].categories = [...(findBookmarks[bookmarkId].categories || []), category];
            }

            if (score === categories.length) {
                bestMatches.push(findBookmarks[bookmarkId]);
            }

            allBookmarks.push(findBookmarks[bookmarkId]);
        }

        await tx.done;

        if (categories.length !== 0) {
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

        if (categories.length > 1 && result.length !== 0) {
            result.unshift({
                category: {
                    id: 'best',
                    name: 'Лучшие совпадения',
                },
                bookmarks: bestMatches,
            });
        }

        // console.log(result, findBookmarks, findCategories);

        return result;
    }

    @action('save bookmarks')
    async saveBookmark(props) {
        const {
            url,
            name,
            description,
            image_url,
            categories = [],
            icoVariant,
            id,
        } = props;

        const saveData = {
            url,
            name: name.trim(),
            description: description && description.trim(),
            icoVariant,
        };

        let saveBookmarkId;
        let icoName = `${Date.now().toString()}`;
        let oldCategories = [];

        if (id) {
            const oldBookmark = await this.getBookmark(id);
            oldCategories = oldBookmark.categories.map((category) => category.id);

            icoName = oldBookmark.icoFileName || icoName;

            saveBookmarkId = await DBConnector().put('bookmarks', {
                ...oldBookmark,
                id,
                ...saveData,
            });
        } else {
            saveBookmarkId = await DBConnector().add('bookmarks', {
                ...saveData,
                icoFileName: icoName,
            });
        }

        const categoriesNow = await DBConnector().getAllFromIndex(
            'bookmarks_by_categories',
            'bookmark_id',
            saveBookmarkId
        );

        await Promise.all(
            categoriesNow.map(({ categoryId, id }) => {
                if (~categories.indexOf(categoryId)) return;

                return DBConnector().delete('bookmarks_by_categories', id);
            }),
        );

        await Promise.all(
            categories.map((categoryId) => {
                if (~oldCategories.indexOf(categoryId)) return;

                return DBConnector().add('bookmarks_by_categories', { categoryId, bookmarkId: saveBookmarkId });
            }),
        );

        if (image_url.substring(0, 11) !== "filesystem:") {
            const img = await new Promise((resolve, reject) => {
                const imgLoad = document.createElement("img");
                imgLoad.crossOrigin = "anonymous";
                imgLoad.src = image_url;

                imgLoad.onload = () => resolve(imgLoad);
                imgLoad.onerror = reject
            });

            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            const context = canvas.getContext('2d');

            context.drawImage(img, 0, 0);

            const blob = await new Promise((resolve) => {
                canvas.toBlob(resolve, 'image/png');
            });

            await FSConnector.saveFile('/bookmarksIcons', blob, icoName);
        }

        this.lastTruthSearchTimestamp = Date.now();
    }

    @action('remove bookmark')
    async removeBookmark(bookmarkId) {
        const oldBookmark = await this.getBookmark(bookmarkId);
        await DBConnector().delete('bookmarks', bookmarkId);

        const removeBinds = await DBConnector().getAllFromIndex(
            'bookmarks_by_categories',
            'bookmark_id',
            bookmarkId
        );

        await Promise.all(removeBinds.map(({ id }) => DBConnector().delete('bookmarks_by_categories', id)));

        await FSConnector.removeFile('/bookmarksIcons', oldBookmark.icoFileName);

        this._syncCategories();
        this.lastTruthSearchTimestamp = Date.now();
    }

    @action('add to favorites')
    addToFavorites({ type, id }) {
        this.favorites.push({
            type,
            id,
        });

        console.log(this.favorites);

        return StorageConnector.setJSONItem('bkms_favorites', this.favorites);
    }

    @action('add to favorites')
    removeFromFavorites({ type, id }) {
        this.favorites = this.favorites.filter((fav) => fav.type !== type || fav.id !== id);

        console.log(this.favorites);

        return StorageConnector.setJSONItem('bkms_favorites', this.favorites);
    }
}

export default BookmarksStore;
