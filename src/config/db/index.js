import upgradeOrCreateBookmarks from './bookmarks';
import upgradeOrCreateTags from './tags';
import upgradeOrCreateFolders from './folders';
import upgradeOrCreateFavorites from './favorites';
import upgradeOrCreatePairWithCloud from './pairWithCloud';
import consoleBinder from '@/utils/console/bind';
import upgradeOrCreateWallpapers from './wallpapers';

const bindConsole = consoleBinder('db');

export default ({ upgrade, blocked, blocking, terminated }) => ({
    async upgrade(db, oldVersion, newVersion, transaction) {
        bindConsole.log(`Require upgrade version from ${oldVersion} to ${newVersion}`);

        const tables = [
            upgradeOrCreateTags,
            upgradeOrCreateFolders,
            upgradeOrCreateBookmarks,
            upgradeOrCreateFavorites,
            upgradeOrCreatePairWithCloud,
            upgradeOrCreateWallpapers,
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

            if (oldVersion !== 0) {
                await store.add({
                    name: 'migrate-to-mv3-require',
                    value: true,
                });
            }
        }

        if (newVersion >= 10 && transaction.objectStoreNames.contains('system_bookmarks')) {
            db.deleteObjectStore('system_bookmarks');
        }

        upgrade();
    },
    blocked(currentVersion, blockedVersion, event) {
        bindConsole.log(`Blocked! currentVersion = ${currentVersion} blockedVersion = ${blockedVersion}`);
        blocked(currentVersion, blockedVersion, event);
    },
    blocking(currentVersion, blockedVersion, event) {
        bindConsole.log(`Blocking! currentVersion = ${currentVersion} blockedVersion = ${blockedVersion}`);
        blocking(currentVersion, blockedVersion, event);
    },
    terminated() {
        terminated();
    },
});
