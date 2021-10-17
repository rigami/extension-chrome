export default async function upgradeOrCreateTagsWaitSync(db, transaction, oldVersion, newVersion) {
    let store;

    if (transaction.objectStoreNames.contains('tags_wait_sync')) {
        store = transaction.objectStore('tags_wait_sync');
    } else {
        store = db.createObjectStore('tags_wait_sync', {
            keyPath: 'id',
            autoIncrement: true,
        });
        store.createIndex('action', 'action', { unique: false });
        store.createIndex('tag_id', 'tagId', { unique: false });
        store.createIndex('commit_date', 'commitDate', { unique: false });
    }
}
