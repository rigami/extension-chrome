export default async function upgradeOrCreateFavorites(db, transaction, oldVersion, newVersion) {
    let store;

    if (transaction.objectStoreNames.contains('favorites')) {
        store = transaction.objectStore('favorites');
    } else {
        store = db.createObjectStore('favorites', {
            keyPath: 'id',
            unique: true,
        });
        store.createIndex('favorite_id', 'favoriteId', { unique: false });
        store.createIndex('type', 'type', { unique: false });
    }

    if (store.indexNames.contains('type')) {
        store.createIndex('item_type', 'itemType', { unique: false });
        store.createIndex('item_id', 'itemId', { unique: false });

        store.deleteIndex('type');
        store.deleteIndex('favorite_id');
    }

    if (!store.indexNames.contains('modified_timestamp')) {
        store.createIndex('modified_timestamp', 'modifiedTimestamp', { unique: false });
    }

    if (!store.indexNames.contains('create_timestamp')) {
        store.createIndex('create_timestamp', 'createTimestamp', { unique: false });
    }

    if (oldVersion !== 0 && oldVersion < 7) {
        (await store.getAll()).forEach((favorite) => store.put({
            id: favorite.id,
            itemId: favorite.itemId,
            itemType: favorite.itemType === 'category' ? 'tag' : favorite.itemType,
        }));
    }
    console.log('Migrate favorites succesfull!');
}
