import { captureException } from '@sentry/browser';
import { BG_SOURCE, BG_TYPE } from '@/enum';

export default async function upgradeOrCreateBackgrounds(db, transaction, oldVersion, newVersion) {
    let store;

    if (transaction.objectStoreNames.contains('backgrounds')) {
        store = transaction.objectStore('backgrounds');
    } else {
        store = db.createObjectStore('backgrounds', {
            keyPath: 'id',
            autoIncrement: true,
        });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('author', 'author', { unique: false });
        store.createIndex('source_link', 'sourceLink', { unique: false });
        store.createIndex('file_name', 'fileName', { unique: false });
    }

    if (!store.indexNames.contains('source')) {
        store.createIndex('source', 'source', { unique: false });

        try {
            (await store.getAll()).forEach((background) => store.put({
                ...background,
                source: background.sourceLink.indexOf('https://unsplash.com') !== -1
                    ? BG_SOURCE.UNSPLASH
                    : BG_SOURCE.USER,
                type: background.sourceLink.substring(background.sourceLink.length - 4) === '.gif'
                    ? BG_TYPE.ANIMATION
                    : background.type,
            }));
        } catch (e) {
            console.log(e);
            captureException(e);
        }
    }

    if (store.indexNames.contains('origin_id')) {
        store.createIndex('id_in_source', 'idInSource', { unique: false });

        try {
            (await store.getAll()).forEach((background) => store.put({
                ...background,
                idInSource: background.originId,
            }));
        } catch (e) {
            console.log(e);
            captureException(e);
        }

        store.deleteIndex('origin_id');
    }

    if (!store.indexNames.contains('id_in_source')) {
        store.createIndex('id_in_source', 'idInSource', { unique: false });
    }

    if (!store.indexNames.contains('author')) {
        store.createIndex('author', 'originId', { unique: false });
    }

    if (!store.indexNames.contains('download_link')) {
        store.createIndex('download_link', 'downloadLink', { unique: false });
    }
}
