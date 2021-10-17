import { omit } from 'lodash';
import { v4 as UUIDv4 } from 'uuid';

export default async function upgradeOrCreateBookmarks(db, transaction, oldVersion, newVersion) {
    let store;

    if (transaction.objectStoreNames.contains('bookmarks')) {
        store = transaction.objectStore('bookmarks');
    } else {
        store = db.createObjectStore('bookmarks', {
            keyPath: 'id',
            unique: true,
        });
        store.createIndex('ico_variant', 'icoVariant', { unique: false });
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

    if (store.indexNames.contains('version')) {
        store.deleteIndex('version');
    }

    if (!store.indexNames.contains('modified_timestamp')) {
        store.createIndex('modified_timestamp', 'modifiedTimestamp', { unique: false });
    }

    if (!store.indexNames.contains('create_timestamp')) {
        store.createIndex('create_timestamp', 'createTimestamp', { unique: false });
    }

    if (!store.indexNames.contains('ico_url')) {
        store.createIndex('ico_url', 'icoUrl', { unique: false });
    }

    if (!store.indexNames.contains('source_ico_url')) {
        store.createIndex('source_ico_url', 'sourceIcoUrl', { unique: false });
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
                tags,
            });
        }
    }
    if (oldVersion !== 0 && oldVersion < 8) {
        const bookmarks = await store.getAll();

        for await (const bookmark of bookmarks) {
            transaction.objectStore('bookmarks').put({
                ...omit(bookmark, ['version']),
                createTimestamp: Date.now(),
                modifiedTimestamp: Date.now(),
            });
        }
    }
    if (oldVersion !== 0 && oldVersion < 10) {
        store.deleteIndex('id');
        store.createIndex('id', 'id', { unique: false });
        const bookmarks = await store.getAll();

        for await (const bookmark of bookmarks) {
            transaction.objectStore('bookmarks').put({
                ...bookmark,
                id: UUIDv4(),
            });
        }
    }
}
