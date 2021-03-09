import { eventToApp } from '@/stores/server/bus';
import FSConnector from '@/utils/fsConnector';
import Category from '@/stores/universal/bookmarks/entities/category';
import Folder from '@/stores/universal/bookmarks/entities/folder';
import { makeAutoObservable } from 'mobx';
import FoldersUniversalService from '@/stores/universal/bookmarks/folders';
import FavoritesUniversalService from '@/stores/universal/bookmarks/favorites';
import BookmarksUniversalService from '@/stores/universal/bookmarks/bookmarks';
import CategoriesUniversalService from '@/stores/universal/bookmarks/categories';
import appVariables from '@/config/appVariables';
import { omit } from 'lodash';

class LocalBackupService {
    core;

    constructor(core) {
        makeAutoObservable(this);
        this.core = core;

        this.core.globalBus.on('system/backup/local/create', async ({ settings, bookmarks }) => {
            try {
                const backup = {};

                if (settings) {
                    backup.settings = await this.collectSettings();
                }

                if (bookmarks) {
                    backup.bookmarks = await this.collectBookmarks();
                }

                backup.meta = {
                    date: new Date().toISOString(),
                    appVersion: appVariables.version,
                    appType: 'extension.chrome',
                    version: 3,
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
            } catch (e) {
                console.error(e);
                eventToApp('system/backup/local/create/progress', { stage: 'error' });
            }
        });

        this.core.globalBus.on('system/backup/local/restore', async ({ backup }) => {
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

                if (backup.meta.version > 3) {
                    eventToApp('system/backup/local/restore/progress', {
                        result: 'error',
                        message: 'wrongVersion',
                    });

                    return;
                }

                eventToApp('system/backup/local/restore/progress', { result: 'start' });

                if (backup.settings) await this.core.settingsService.restore(backup.settings);
                if (backup.bookmarks) await this.core.bookmarksSyncService.restore(backup.bookmarks);

                eventToApp('system/backup/local/restore/progress', { result: 'done' });
            } catch (e) {
                console.log('Failed restore backup:', e);
                eventToApp('system/backup/local/restore/progress', {
                    result: 'error',
                    message: 'wrongSchema',
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
        const bookmarksAll = await BookmarksUniversalService.query();

        const bookmarks = await Promise.all(bookmarksAll[0].bookmarks.map(async (bookmark) => {
            let image;

            try {
                image = await FSConnector.getFileAsBase64(`/bookmarksIcons/${bookmark.icoFileName}`);
            } catch (e) {
                console.warn('Failed get icon', e, bookmark);
            }

            return {
                ...omit(bookmark, ['icoFileName', 'imageUrl']),
                categories: bookmark.categories.map(({ id }) => id),
                image,
            };
        }));

        const categoriesAll = await CategoriesUniversalService.getAll();

        const categories = categoriesAll.map((category) => new Category(category));

        const foldersAll = await FoldersUniversalService.getTree();

        const folders = foldersAll.map((folder) => new Folder(folder));

        const favoritesAll = await FavoritesUniversalService.getAll();

        console.log('favoritesAll', favoritesAll);

        const favorites = favoritesAll;

        return {
            bookmarks,
            favorites,
            categories,
            folders,
        };
    }
}

export default LocalBackupService;
