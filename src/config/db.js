function upgradeOrCreateBackgrounds(db, transaction) {
    let store;

    if (db.objectStoreNames.contains('backgrounds')) {
        store = transaction.objectStore('backgrounds');
    } else {
        store = db.createObjectStore('backgrounds', {
            keyPath: 'id',
            autoIncrement: true,
        });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('author', 'author', { unique: false });
        store.createIndex('source_link', 'sourceLink', { unique: false });
        store.createIndex('file_name', 'fileName', { unique: false });
    }

    return store;
}

function upgradeOrCreateBookmarks(db, transaction) {
    let store;

    if (db.objectStoreNames.contains('bookmarks')) {
        store = transaction.objectStore('bookmarks');
    } else {
        store = db.createObjectStore('bookmarks', {
            keyPath: 'id',
            autoIncrement: true,
        });
        store.createIndex('ico_variant', 'icoVariant', { unique: false });
        store.createIndex('ico_file_name', 'icoFileName', { unique: false });
        store.createIndex('url', 'url', { unique: false });
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('description', 'description', { unique: false });
        store.createIndex('count_clicks', 'countClicks', { unique: false });
        store.createIndex('folder_id', 'folderId', { unique: false });
    }

    if (!store.indexNames.contains("folder_id")) {
        store.createIndex('folder_id', 'folderId', { unique: false });
    }

    return store;
}

function upgradeOrCreateCategories(db, transaction) {
    let store;

    if (db.objectStoreNames.contains('categories')) {
        store = transaction.objectStore('categories');
    } else {
        store = db.createObjectStore('categories', {
            keyPath: 'id',
            autoIncrement: true,
        });
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('color', 'color', { unique: true });
    }

    return store;
}

function upgradeOrCreateBookmarksByCategories(db, transaction) {
    let store;

    if (db.objectStoreNames.contains('bookmarks_by_categories')) {
        store = transaction.objectStore('bookmarks_by_categories');
    } else {
        store = db.createObjectStore('bookmarks_by_categories', {
            keyPath: 'id',
            autoIncrement: true,
        });
        store.createIndex('category_id', 'categoryId', { unique: false });
        store.createIndex('bookmark_id', 'bookmarkId', { unique: false });
    }

    return store;
}

function upgradeOrCreateFolders(db, transaction) {
    let store;

    if (db.objectStoreNames.contains('folders')) {
        store = transaction.objectStore('folders');
    } else {
        store = db.createObjectStore('folders', {
            keyPath: 'id',
            autoIncrement: true,
        });
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('parent_id', 'parentId', { unique: false });

        store.add({
            name: 'rigami',
            parentId: 0,
        });
    }

    return store;
}

function upgradeOrCreateFavorites(db, transaction) {
    let store;

    if (db.objectStoreNames.contains('favorites')) {
        store = transaction.objectStore('favorites');
    } else {
        store = db.createObjectStore('favorites', {
            keyPath: 'id',
            autoIncrement: true,
        });
        store.createIndex('favorite_id', 'favoriteId', { unique: false });
        store.createIndex('type', 'type', { unique: false });
    }

    return store;
}


export default {
    upgrade(db, oldVersion, newVersion, transaction) {
        console.log('upgrade db', db, transaction);
        upgradeOrCreateBackgrounds(db, transaction);
        upgradeOrCreateBookmarks(db, transaction);
        upgradeOrCreateCategories(db, transaction);
        upgradeOrCreateBookmarksByCategories(db, transaction);
        upgradeOrCreateFolders(db, transaction);
        upgradeOrCreateFavorites(db, transaction);
    },
    blocked() {},
    blocking() {},
    terminated() {},
};
