import { BG_SOURCE, BG_TYPE } from '@/enum';
import { difference } from 'lodash';

async function upgradeOrCreateBackgrounds(db, transaction) {
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

    if (!store.indexNames.contains('source')) {
        store.createIndex('source', 'source', { unique: false });

        try {
            (await store.getAll()).forEach((background) => store.put({
                ...background,
                source: background.sourceLink.indexOf('https://unsplash.com') !== -1
                    ? BG_SOURCE.UNSPLASH
                    : BG_SOURCE.USER,
                type: background.sourceLink.substring(background.sourceLink.length - 4) === '.gif'
                    ? BG_TYPE.ANIMATION
                    : background.type,
            }));
        } catch (e) {
            console.log(e);
        }
    }

    if (!store.indexNames.contains('origin_id')) {
        store.createIndex('origin_id', 'originId', { unique: false });
    }

    if (!store.indexNames.contains('author')) {
        store.createIndex('author', 'originId', { unique: false });
    }

    if (!store.indexNames.contains('download_link')) {
        store.createIndex('download_link', 'downloadLink', { unique: false });
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

    if (!store.indexNames.contains('folder_id')) {
        store.createIndex('folder_id', 'folderId', { unique: false });

        (await store.getAll()).forEach((bookmark) => store.put({
            ...bookmark,
            folderId: bookmark.folderId || 1,
        }));
    }

    if (!store.indexNames.contains('tags')) {
        store.createIndex('tags', 'tags', { unique: false });
    }

    if (!store.indexNames.contains('version')) {
        store.createIndex('version', 'version', { unique: false });
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
        store.createIndex('system_id', 'systemId', { unique: true });
    }

    return store;
}

function upgradeOrCreateTags(db, transaction) {
    let store;

    if (db.objectStoreNames.contains('tags')) {
        store = transaction.objectStore('tags');
    } else {
        store = db.createObjectStore('tags', {
            keyPath: 'id',
            autoIncrement: true,
        });
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('color', 'color', { unique: true });
    }

    return store;
}

async function upgradeOrCreateFolders(db, transaction) {
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

async function upgradeOrCreateFavorites(db, transaction) {
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

    if (store.indexNames.contains('type')) {
        store.createIndex('item_type', 'itemType', { unique: false });
        store.createIndex('item_id', 'itemId', { unique: false });

        store.deleteIndex('type');
        store.deleteIndex('favorite_id');

        (await store.getAll()).forEach((favorite) => store.put({
            id: favorite.id,
            itemId: favorite.favoriteId,
            itemType: favorite.type === 'category' ? 'tag' : favorite.type,
        }));
    }

    return store;
}

async function migrate(db, version) {
    console.log('Migrate!');

    if (version <= 7) {
        console.log('Remove bookmarks_by_categories...');
        const categories = await db.getAll('categories');
        const bookmarks = await db.getAll('bookmarks');
        const bookmarksByCategories = await db.getAll('bookmarks_by_categories');

        for await (const bookmark of bookmarks) {
            const tags = bookmarksByCategories
                .filter(({ bookmarkId }) => bookmarkId === bookmark.id)
                .map(({ tagId }) => tagId);

            db.put('bookmarks', {
                ...bookmark,
                version: 1,
                tags,
            });
        }

        await Promise.all(categories.map((tag) => db.put('tags', {
            id: tag.id,
            name: tag.name,
            color: tag.color,
        })));

        await db.deleteObjectStore('categories');
        await db.deleteObjectStore('bookmarks_by_categories');
    }
}

export default ({ upgrade }) => ({
    upgrade(db, oldVersion, newVersion, transaction) {
        console.log('upgrade db', db, transaction, oldVersion, newVersion);
        upgradeOrCreateBackgrounds(db, transaction, newVersion);
        upgradeOrCreateBookmarks(db, transaction, newVersion);
        upgradeOrCreateSystemBookmarks(db, transaction, newVersion);
        upgradeOrCreateTags(db, transaction);
        upgradeOrCreateFolders(db, transaction, newVersion);
        upgradeOrCreateFavorites(db, transaction, newVersion);
        if (oldVersion >= 7 && db.objectStoreNames.contains('bookmarks_by_categories')) {
            db.deleteObjectStore('bookmarks_by_categories');
        }

        upgrade();
    },
    blocked() {},
    blocking() {},
    terminated() {},
});

export { migrate };
