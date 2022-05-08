import { captureException } from '@sentry/browser';
import { BG_SOURCE, BG_TYPE } from '@/enum';

export default async function upgradeOrCreateWallpapers(db, transaction, oldVersion, newVersion) {
    let store;

    if (transaction.objectStoreNames.contains('wallpapers')) {
        store = transaction.objectStore('wallpapers');
    } else {
        store = db.createObjectStore('wallpapers', {
            keyPath: 'id',
            autoIncrement: true,
        });
        store.createIndex('source', 'source', { unique: false });
        store.createIndex('type', 'type', { unique: false });
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
        store.deleteIndex('origin_id');
    }

    if (store.indexNames.contains('id_in_source')) {
        store.deleteIndex('id_in_source');
    }

    if (store.indexNames.contains('author')) {
        store.deleteIndex('author');
    }

    if (store.indexNames.contains('download_link')) {
        store.deleteIndex('download_link');
    }

    if (store.indexNames.contains('file_name')) {
        store.deleteIndex('file_name');
    }
}
