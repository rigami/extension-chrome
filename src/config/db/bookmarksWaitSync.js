export default async function upgradeOrCreateBookmarksWaitSync(db, transaction, oldVersion, newVersion) {
    let store;

    if (transaction.objectStoreNames.contains('bookmarks_wait_sync')) {
        store = transaction.objectStore('bookmarks_wait_sync');
    } else {
        store = db.createObjectStore('bookmarks_wait_sync', {
            keyPath: 'id',
            autoIncrement: true,
        });
        store.createIndex('action', 'action', { unique: false });
        store.createIndex('bookmark_id', 'bookmarkId', { unique: false });
        store.createIndex('commit_date', 'commitDate', { unique: false });
    }
}
