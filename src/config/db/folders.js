import { uuid, FIRST_UUID, NULL_UUID } from '@/utils/generate/uuid';

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
        const folders = await store.getAll();
        const newIds = {};

        console.log('folders:', folders);

        folders.forEach((folder) => {
            newIds[folder.id] = newIds[folder.id] || (folder.id === 1 ? FIRST_UUID : uuid());
            newIds[folder.parentId] = newIds[folder.parentId] || (folder.parentId === 0 ? NULL_UUID : uuid());
        });

        for await (const folder of folders) {
            console.log('upgradeOrCreateFolders migrate:', folder, newIds[folder.id]);
            transaction.objectStore('folders').delete(folder.id);
            transaction.objectStore('folders').put({
                createTimestamp: Date.now(),
                modifiedTimestamp: Date.now(),
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
    console.log('Migrate folders succesfull!');
}
