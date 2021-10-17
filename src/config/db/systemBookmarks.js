export default function upgradeOrCreateSystemBookmarks(db, transaction, oldVersion, newVersion) {
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
