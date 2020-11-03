import BusApp, { eventToApp } from '@/stores/backgroundApp/busApp';
import FSConnector from '@/utils/fsConnector';
import DBConnector from '@/utils/dbConnector';
import Category from '@/stores/bookmarks/entities/category';

class LocalBackup {
    bus;
    bookmarksService;
    settingsSyncService;
    bookmarksSyncService;

    constructor(bookmarksService, settingsSyncService, bookmarksSyncService) {
        this.bus = BusApp();
        this.bookmarksService = bookmarksService;
        this.settingsSyncService = settingsSyncService;
        this.bookmarksSyncService = bookmarksSyncService;

        this.bus.on('system/backup/local/create', async ({ settings, bookmarks }) => {
            const backup = {};

            if (settings) {
                backup.settings = await this.collectSettings();
            }

            if (bookmarks) {
                backup.bookmarks = await this.collectBookmarks();
            }

            backup.meta = {
                date: new Date().toISOString(),
                appVersion: chrome?.runtime?.getManifest?.().version,
                appType: 'extension.chrome',
                version: 1,
            };

            console.log('Backup:', backup);

            const backupPath = '/temp/backup.json';

            await FSConnector.saveFile(
                backupPath,
                new Blob([JSON.stringify(backup)], { type: 'application/json' }),
            );

            eventToApp('system/backup/local/create/progress', {
                path: backupPath,
                stage: 'done',
            });
        });

        this.bus.on('system/backup/local/restore', async ({ backup }) => {
            console.log('restore backup', backup);

            try {
                if (backup.product === 'ClockTab') {
                    eventToApp('system/backup/local/restore/progress', {
                        action: 'prompt',
                        type: 'oldAppBackupFile',
                        file: backup,
                    });

                    return;
                }

                if (backup.meta.version !== 1) {
                    eventToApp('system/backup/local/restore/progress', {
                        result: 'error',
                        message: 'settings.backup.localBackup.noty.failed.wrongVersion',
                    });
                }

                if (backup.settings) await this.settingsSyncService.restore(backup.settings);
                if (backup.bookmarks) await this.bookmarksSyncService.restore(backup.bookmarks);

                eventToApp('system/backup/local/restore/progress', { result: 'done' });
            } catch (e) {
                eventToApp('system/backup/local/restore/progress', {
                    result: 'error',
                    message: 'settings.backup.localBackup.noty.failed.wrongSchema',
                });
            }
        });
    }

    collectSettings() {
        return FSConnector.getFileAsText('/settings.json')
            .then((props) => {
                console.log(props);

                return { ...JSON.parse(props) };
            })
            .catch((e) => {
                console.error(e);

                return {};
            });
    }

    async collectBookmarks() {
        const bookmarksAll = await this.bookmarksService.query();

        const bookmarks = [];

        for (const bookmark of bookmarksAll[0].bookmarks) {
            bookmark.categories = bookmark.categories.map(({ id }) => id);

            try {
                bookmark.image = await FSConnector.getFileAsBase64(`/bookmarksIcons/${bookmark.icoFileName}`);
            } catch (e) {
                console.warn('Failed get icon', e, bookmark);
            }

            delete bookmark.icoFileName;
            delete bookmark.imageUrl;

            bookmarks.push(bookmark);
        }

        const categoriesAll = await DBConnector().getAll('categories');

        const categories = categoriesAll.map((category) => new Category(category));

        const favoritesAll = await DBConnector().getAll('favorites');

        const favorites = favoritesAll.map(({ favoriteId, type }) => ({
            id: favoriteId,
            type,
        }));

        return {
            bookmarks,
            favorites,
            categories,
        };
    }
}

export default LocalBackup;
