import upgradeOrCreateBackgrounds from './backgrounds';
import upgradeOrCreateBookmarks from './bookmarks';
import upgradeOrCreateTags from './tags';
import upgradeOrCreateFolders from './folders';
import upgradeOrCreateFavorites from './favorites';
import upgradeOrCreateSystemBookmarks from './systemBookmarks';
import upgradeOrCreatePairWithCloud from './pairWithCloud';
import consoleBinder from '@/utils/console/bind';

const bindConsole = consoleBinder('db');

export default ({ upgrade, blocked, blocking, terminated }) => ({
    async upgrade(db, oldVersion, newVersion, transaction) {
        bindConsole.log(`Require upgrade version from ${oldVersion} to ${newVersion}`);

        const tables = [
            upgradeOrCreateBookmarks,
            upgradeOrCreateFolders,
            upgradeOrCreateTags,
            upgradeOrCreateFavorites,
            upgradeOrCreatePairWithCloud,
            upgradeOrCreateBackgrounds,
            upgradeOrCreateSystemBookmarks,
        ];

        for await (const table of tables) {
            await table(db, transaction, oldVersion, newVersion);
        }

        if (newVersion >= 7 && transaction.objectStoreNames.contains('bookmarks_by_categories')) {
            db.deleteObjectStore('bookmarks_by_categories');
        }

        if (oldVersion <= 8) {
            const store = db.createObjectStore('temp', {
                keyPath: 'id',
                autoIncrement: true,
            });
            store.createIndex('name', 'name', { unique: true });
            store.createIndex('value', 'value', { unique: false });

            if (oldVersion !== 0) {
                await store.add({
                    name: 'migrate-to-mv3-require',
                    value: true,
                });
            }
        }

        upgrade();
    },
    blocked() {
        blocked();
    },
    blocking() {
        blocking();
    },
    terminated() {
        terminated();
    },
});
