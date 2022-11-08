export default async function upgradeOrCreatePairWithCloud(db, transaction, oldVersion, newVersion) {
    let store;

    if (transaction.objectStoreNames.contains('pair_with_cloud')) {
        store = transaction.objectStore('pair_with_cloud');
    } else {
        store = db.createObjectStore('pair_with_cloud', {
            keyPath: 'entityType_localId',
            unique: true,
        });
        store.createIndex('entity_type', 'entityType', { unique: false });
        store.createIndex('local_id', 'localId', { unique: false });
        store.createIndex('cloud_id', 'cloudId', { unique: false });
        store.createIndex('is_pair', 'isPair', { unique: false });
        store.createIndex('is_sync', 'isSync', { unique: false });
        store.createIndex('is_deleted', 'isDeleted', { unique: false });
        store.createIndex('modified_timestamp', 'modifiedTimestamp', { unique: false });
    }
}
