import { omit } from 'lodash';
import { uuid } from '@/utils/generate/uuid';

function createStructure(db) {
    const store = db.createObjectStore('bookmarks', {
        keyPath: 'id',
        unique: true,
    });

    // General
    store.createIndex('url', 'url', { unique: false });
    store.createIndex('name', 'name', { unique: false });
    store.createIndex('description', 'description', { unique: false });
    store.createIndex('tags', 'tags', { unique: false });
    store.createIndex('folder_id', 'folderId', { unique: false });

    // Metadata
    store.createIndex('count_clicks', 'countClicks', { unique: false });
    store.createIndex('modified_timestamp', 'modifiedTimestamp', { unique: false });
    store.createIndex('create_timestamp', 'createTimestamp', { unique: false });

    return store;
}

async function migrateStructure(db, transaction, oldVersion, newVersion) {
    const store = transaction.objectStore('bookmarks');

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

    if (!store.indexNames.contains('modified_timestamp')) {
        store.createIndex('modified_timestamp', 'modifiedTimestamp', { unique: false });
    }

    if (!store.indexNames.contains('create_timestamp')) {
        store.createIndex('create_timestamp', 'createTimestamp', { unique: false });
    }

    if (store.indexNames.contains('ico_url')) {
        store.deleteIndex('ico_url');
    }

    if (store.indexNames.contains('source_ico_url')) {
        store.deleteIndex('source_ico_url');
    }

    if (store.indexNames.contains('version')) {
        store.deleteIndex('version');
    }

    if (oldVersion !== 0 && oldVersion < 10) {
        const bookmarks = await store.getAll();
        let bookmarksByCategories;

        if (oldVersion < 7) {
            bookmarksByCategories = await transaction.objectStore('bookmarks_by_categories').getAll();
        }

        for await (const bookmark of bookmarks) {
            let modifiedBookmark = bookmark;

            if (oldVersion < 7) {
                const tags = bookmarksByCategories
                    .filter(({ bookmarkId }) => bookmarkId === bookmark.id)
                    .map(({ categoryId }) => categoryId);

                modifiedBookmark = {
                    ...bookmark,
                    tags,
                };
            }
            if (oldVersion < 8) {
                modifiedBookmark = {
                    ...omit(bookmark, ['version']),
                    createTimestamp: Date.now(),
                    modifiedTimestamp: Date.now(),
                };
            }

            transaction.objectStore('bookmarks').put(modifiedBookmark);
        }
    }
    console.log('Migrate bookmarks succesfull!');
}

export default async function upgradeOrCreateBookmarks(db, transaction, oldVersion, newVersion) {
    if (transaction.objectStoreNames.contains('bookmarks')) {
        await migrateStructure(db, transaction, oldVersion, newVersion);
    } else {
        createStructure(db);
    }
}
