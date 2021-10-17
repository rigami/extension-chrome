export default async function upgradeOrCreateFoldersWaitSync(db, transaction, oldVersion, newVersion) {
    let store;

    if (transaction.objectStoreNames.contains('folders_wait_sync')) {
        store = transaction.objectStore('folders_wait_sync');
    } else {
        store = db.createObjectStore('folders_wait_sync', {
            keyPath: 'id',
            autoIncrement: true,
        });
        store.createIndex('action', 'action', { unique: false });
        store.createIndex('folder_id', 'folderId', { unique: false });
        store.createIndex('commit_date', 'commitDate', { unique: false });
    }
}
