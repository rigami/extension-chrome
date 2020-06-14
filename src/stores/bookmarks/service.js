import { action, observable } from 'mobx';
import StorageConnector from '@/utils/storageConnector';
import { hslToRgb, recomposeColor } from '@material-ui/core/styles/colorManipulator';
import DBConnector from '@/utils/dbConnector';
import { cachingDecorator } from '@/utils/decorators';
import EventBus from '@/utils/eventBus';
import getUniqueColor from "@/utils/uniqueColor";

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

    @action('add category')
    async addCategory(name) {
        const countCategories = await DBConnector().count('categories')
        const color = getUniqueColor(countCategories);

        const similarCategory = await DBConnector().getFromIndex('categories', 'name', name);

        if (similarCategory) {
            throw new Error("category_already_exist");
        }

        const categoryId = await DBConnector().add('categories', {
            name: name.trim(),
            color,
        });

        this._syncCategories();

        return categoryId;
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
                findBookmarks[bookmark.id] = bookmark;
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
            ico_url,
            categories = [],
            type,
            id,
        } = props;

        const saveData = {
            url,
            name: name.trim(),
            description: description && description.trim(),
            type,
        };

        let saveBookmarkId;
        let oldCategories = [];

        if (id) {
            const oldBookmark = await this.getBookmark(id);
            oldCategories = oldBookmark.categories.map((category) => category.id);

            saveBookmarkId = await DBConnector().put('bookmarks', { id, ...saveData });
        } else {
            saveBookmarkId = await DBConnector().add('bookmarks', saveData);
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
