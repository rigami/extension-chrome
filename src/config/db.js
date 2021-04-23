import { BG_SOURCE, BG_TYPE } from '@/enum';
import { captureException } from '@sentry/react';

async function upgradeOrCreateBackgrounds(db, transaction, oldVersion, newVersion) {
    let store;

    if (transaction.objectStoreNames.contains('backgrounds')) {
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
            captureException(e);
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
}

async function upgradeOrCreateBookmarks(db, transaction, oldVersion, newVersion) {
    let store;

    if (transaction.objectStoreNames.contains('bookmarks')) {
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

    if (!store.indexNames.contains('modified_timestamp')) {
        store.createIndex('modified_timestamp', 'modifiedTimestamp', { unique: false });
    }

    if (!store.indexNames.contains('create_timestamp')) {
        store.createIndex('create_timestamp', 'createTimestamp', { unique: false });
    }

    if (oldVersion !== 0 && oldVersion < 7) {
        const bookmarks = await store.getAll();
        const bookmarksByCategories = await transaction.objectStore('bookmarks_by_categories').getAll();

        for await (const bookmark of bookmarks) {
            const tags = bookmarksByCategories
                .filter(({ bookmarkId }) => bookmarkId === bookmark.id)
                .map(({ categoryId }) => categoryId);

            transaction.objectStore('bookmarks').put({
                ...bookmark,
                version: 1,
                tags,
            });
        }
    }
}

function upgradeOrCreateSystemBookmarks(db, transaction, oldVersion, newVersion) {
    let store;

    if (transaction.objectStoreNames.contains('system_bookmarks')) {
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
}

async function upgradeOrCreateTags(db, transaction, oldVersion, newVersion) {
    let store;

    if (transaction.objectStoreNames.contains('tags')) {
        store = transaction.objectStore('tags');
    } else {
        store = db.createObjectStore('tags', {
            keyPath: 'id',
            autoIncrement: true,
        });
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('color', 'color', { unique: true });
    }

    if (oldVersion !== 0 && oldVersion < 7) {
        const categories = await transaction.objectStore('categories').getAll();

        await Promise.all(categories.map((tag) => transaction.objectStore('tags').put({
            id: tag.id,
            name: tag.name,
            color: tag.color,
        })));
        db.deleteObjectStore('categories');
    }
}

async function upgradeOrCreateFolders(db, transaction, oldVersion, newVersion) {
    let store;

    if (transaction.objectStoreNames.contains('folders')) {
        store = transaction.objectStore('folders');
    } else {
        store = db.createObjectStore('folders', {
            keyPath: 'id',
            autoIncrement: true,
        });
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('parent_id', 'parentId', { unique: false });

        await store.add({
            name: 'Sundry',
            parentId: 0,
        });
    }
}

async function upgradeOrCreateFavorites(db, transaction, oldVersion, newVersion) {
    let store;

    if (transaction.objectStoreNames.contains('favorites')) {
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
    }

    if (oldVersion !== 0 && oldVersion < 7) {
        (await store.getAll()).forEach((favorite) => store.put({
            id: favorite.id,
            itemId: favorite.itemId,
            itemType: favorite.itemType === 'category' ? 'tag' : favorite.itemType,
        }));
    }
}

export default ({ upgrade }) => ({
    async upgrade(db, oldVersion, newVersion, transaction) {
        console.log('upgrade db', db, transaction, oldVersion, newVersion);
        await upgradeOrCreateBackgrounds(db, transaction, oldVersion, newVersion);
        await upgradeOrCreateBookmarks(db, transaction, oldVersion, newVersion);
        await upgradeOrCreateSystemBookmarks(db, transaction, oldVersion, newVersion);
        await upgradeOrCreateTags(db, transaction, oldVersion, newVersion);
        await upgradeOrCreateFolders(db, transaction, oldVersion, newVersion);
        await upgradeOrCreateFavorites(db, transaction, oldVersion, newVersion);
        if (newVersion >= 7 && transaction.objectStoreNames.contains('bookmarks_by_categories')) {
            db.deleteObjectStore('bookmarks_by_categories');
        }

        upgrade();
    },
    blocked() {},
    blocking() {},
    terminated() {},
});
