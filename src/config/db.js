import DBConnector from '@/utils/dbConnector';
import { toJS } from 'mobx';

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

async function upgradeOrCreateBookmarks(db, transaction) {
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

        (await store.getAll()).forEach((bookmark) => store.put({
            ...bookmark,
            folderId: bookmark.folderId || 1,
        }))
    }

    return store;
}

function upgradeOrCreateSystemBookmarks(db, transaction) {
    let store;

    if (db.objectStoreNames.contains('system_bookmarks')) {
        store = transaction.objectStore('system_bookmarks');
    } else {
        store = db.createObjectStore('system_bookmarks', {
            keyPath: 'id',
            autoIncrement: true,
        });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('rigami_id', 'rigamiId', { unique: false });
        store.createIndex('system_id', 'systemId', { unique: false });
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

async function upgradeOrCreateFolders(db, transaction, newVersion) {
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

        await store.add({
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

async function migrate(version) {
    console.log('Migrate!')

    if (version === 3) {
        console.log('Rename old folders');
        const renameFolder = (folderIndex, folderNames, oldName) => {
            let newFolderName = oldName;
            let count = 1;

            while (folderNames.indexOf(newFolderName) !== -1) {
                count += 1;
                newFolderName = `${oldName} ${count}`;
            }

            return newFolderName
        }

        const findRenamedFolders = async (folderId) => {
            let folders = await DBConnector().getAllFromIndex('folders', 'parent_id', folderId);

            console.log('check level', folderId, toJS(folders))

            if (folders.length === 0) return [];

            let renamedFolders = [];

            const changedFolders = folders.map(({ name, ...folder }, index) => {
                const newName = renameFolder(index, [...renamedFolders].splice(0, index), folders[index].name);

                renamedFolders.push(newName);

                return {
                    ...folder,
                    name,
                    newName,
                };
            }).filter(({ name, newName }) => name !== newName);

            const childFolders = (await Promise.all(folders.map((folder) => findRenamedFolders(folder.id)))).flat();

            return [...changedFolders, ...childFolders];
        }

        const changedFolders = await findRenamedFolders(0);

        await Promise.all(changedFolders.map((folder) => {
            return DBConnector().put('folders', {
                id: folder.id,
                name: folder.newName.trim(),
                parentId: folder.parentId,
            })
        }));
    }
}


export default ({ upgrade }) => ({
    upgrade(db, oldVersion, newVersion, transaction) {
        console.log('upgrade db', db, transaction, oldVersion, newVersion);
        upgradeOrCreateBackgrounds(db, transaction);
        upgradeOrCreateBookmarks(db, transaction);
        upgradeOrCreateSystemBookmarks(db, transaction);
        upgradeOrCreateCategories(db, transaction);
        upgradeOrCreateBookmarksByCategories(db, transaction);
        upgradeOrCreateFolders(db, transaction, newVersion).catch(console.error);
        upgradeOrCreateFavorites(db, transaction);

        upgrade();
    },
    blocked() {},
    blocking() {},
    terminated() {},
});

export { migrate };
