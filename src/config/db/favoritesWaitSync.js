export default async function upgradeOrCreateFavoritesWaitSync(db, transaction, oldVersion, newVersion) {
    let store;

    if (transaction.objectStoreNames.contains('favorites_wait_sync')) {
        store = transaction.objectStore('favorites_wait_sync');
    } else {
        store = db.createObjectStore('favorites_wait_sync', {
            keyPath: 'id',
            autoIncrement: true,
        });
        store.createIndex('action', 'action', { unique: false });
        store.createIndex('item_type', 'itemType', { unique: false });
        store.createIndex('item_id', 'itemId', { unique: false });
        store.createIndex('commit_date', 'commitDate', { unique: false });
    }
}
