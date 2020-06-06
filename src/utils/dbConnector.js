import { openDB } from 'idb/with-async-ittr.js';
import appVariables from '../config/appVariables';

let _db = null;

const open = () => openDB(appVariables.db.name, appVariables.db.version, {
    upgrade(db) {
        const backgroundsStore = db.createObjectStore('backgrounds', {
            keyPath: 'id',
            autoIncrement: true,
        });
        backgroundsStore.createIndex('type', 'type', { unique: false });
        backgroundsStore.createIndex('author', 'author', { unique: false });
        backgroundsStore.createIndex('source_link', 'sourceLink', { unique: false });
        backgroundsStore.createIndex('file_name', 'fileName', { unique: false });

        const bookmarksStore = db.createObjectStore('bookmarks', {
            keyPath: 'id',
            autoIncrement: true,
        });
        bookmarksStore.createIndex('type', 'type', { unique: false });
        bookmarksStore.createIndex('ico_file_name', 'icoFileName', { unique: false });
        bookmarksStore.createIndex('url', 'url', { unique: false });
        bookmarksStore.createIndex('name', 'name', { unique: false });
        bookmarksStore.createIndex('description', 'description', { unique: false });
        bookmarksStore.createIndex('count_clicks', 'countClicks', { unique: false });

        const bByCStore = db.createObjectStore('bookmarks_by_categories', {
            keyPath: 'id',
            autoIncrement: true,
        });
        bByCStore.createIndex('category_id', 'categoryId', { unique: false });
        bByCStore.createIndex('bookmark_id', 'bookmarkId', { unique: false });

        const categoriesStore = db.createObjectStore('categories', {
            keyPath: 'id',
            autoIncrement: true,
        });
        categoriesStore.createIndex('name', 'name', { unique: false });
        categoriesStore.createIndex('color', 'color', { unique: true });
    },
    blocked() {},
    blocking() {},
    terminated() {},
})
    .then((db) => { _db = db; });

export { open };
export default () => _db;
