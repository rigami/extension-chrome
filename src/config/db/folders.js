import { uuid } from '@/utils/generate/uuid';

export default async function upgradeOrCreateFolders(db, transaction, oldVersion, newVersion) {
    let store;

    if (transaction.objectStoreNames.contains('folders')) {
        store = transaction.objectStore('folders');
    } else {
        store = db.createObjectStore('folders', {
            keyPath: 'id',
            unique: true,
        });
        store.createIndex('name', 'name', { unique: false });
        store.createIndex('parent_id', 'parentId', { unique: false });
    }

    if (!store.indexNames.contains('modified_timestamp')) {
        store.createIndex('modified_timestamp', 'modifiedTimestamp', { unique: false });
    }

    if (!store.indexNames.contains('create_timestamp')) {
        store.createIndex('create_timestamp', 'createTimestamp', { unique: false });
    }

    if (oldVersion !== 0 && oldVersion < 10) {
        store.deleteIndex('id');
        store.createIndex('id', 'id', { unique: false });
        const folders = await store.getAll();
        const newIds = {};

        folders.forEach((folder) => {
            newIds[folder.id] = uuid();
        });

        for await (const folder of folders) {
            transaction.objectStore('folders').put({
                ...folder,
                id: newIds[folder.id],
                parentId: newIds[folder.parentId],
            });
        }

        const bookmarks = await transaction.objectStore('bookmarks').getAll();

        for await (const bookmark of bookmarks) {
            transaction.objectStore('bookmarks').put({
                ...bookmark,
                folderId: newIds[bookmark.folderId],
            });
        }
    }
}
