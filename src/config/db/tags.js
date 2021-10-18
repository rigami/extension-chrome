import { uuid } from '@/utils/generate/uuid';

export default async function upgradeOrCreateTags(db, transaction, oldVersion, newVersion) {
    let store;

    if (transaction.objectStoreNames.contains('tags')) {
        store = transaction.objectStore('tags');
    } else {
        store = db.createObjectStore('tags', {
            keyPath: 'id',
            unique: true,
        });
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('color', 'color', { unique: true });
    }

    if (!store.indexNames.contains('modified_timestamp')) {
        store.createIndex('modified_timestamp', 'modifiedTimestamp', { unique: false });
    }

    if (!store.indexNames.contains('create_timestamp')) {
        store.createIndex('create_timestamp', 'createTimestamp', { unique: false });
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
    if (oldVersion !== 0 && oldVersion < 10) {
        store.deleteIndex('id');
        store.createIndex('id', 'id', { unique: false });
        const tags = await store.getAll();
        const newIds = {};

        tags.forEach((folder) => {
            newIds[folder.id] = uuid();
        });

        for await (const tag of tags) {
            transaction.objectStore('tags').put({
                ...tag,
                id: uuid(),
            });
        }

        const bookmarks = await transaction.objectStore('bookmarks').getAll();

        for await (const bookmark of bookmarks) {
            transaction.objectStore('bookmarks').put({
                ...bookmark,
                tags: bookmark.tags.map((tagId) => newIds[tagId]),
            });
        }
    }
}
