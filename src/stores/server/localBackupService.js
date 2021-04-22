import { eventToApp } from '@/stores/server/bus';
import fs from '@/utils/fs';
import Tag from '@/stores/universal/bookmarks/entities/tag';
import Folder from '@/stores/universal/bookmarks/entities/folder';
import { makeAutoObservable } from 'mobx';
import FoldersUniversalService from '@/stores/universal/bookmarks/folders';
import FavoritesUniversalService from '@/stores/universal/bookmarks/favorites';
import BookmarksUniversalService from '@/stores/universal/bookmarks/bookmarks';
import TagsUniversalService from '@/stores/universal/bookmarks/tags';
import appVariables from '@/config/appVariables';
import { omit, map } from 'lodash';
import JSZip from 'jszip';
import BackgroundsUniversalService from '@/stores/universal/backgrounds/service';
import convertClockTabToRigami from '@/utils/convetClockTabToRigami';
import { captureException } from '@sentry/react';

class LocalBackupService {
    core;

    constructor(core) {
        makeAutoObservable(this);
        this.core = core;

        this.core.globalBus.on('system/backup/local/create', async ({ settings, bookmarks, backgrounds }) => {
            eventToApp('system/backup/local/create/progress', { stage: 'start' });
            this.core.storageService.updatePersistent({ localBackup: 'creating' });

            try {
                const backup = {};

                if (settings) {
                    backup.settings = await this.collectSettings();
                }

                if (bookmarks) {
                    backup.bookmarks = await this.collectBookmarks();
                }

                if (backgrounds) {
                    backup.backgrounds = await this.collectBackgrounds();
                }

                backup.meta = {
                    date: new Date().toISOString(),
                    appVersion: appVariables.version,
                    appType: 'extension.chrome',
                    version: 4,
                };

                console.log('Backup:', backup);

                const zip = new JSZip();

                zip.file('meta.json', JSON.stringify(backup.meta));
                if (settings) zip.file('settings.json', JSON.stringify(backup.settings));
                if (bookmarks) zip.file('bookmarks.json', JSON.stringify(backup.bookmarks));
                if (backgrounds) {
                    zip.file('backgrounds.json', JSON.stringify(backup.backgrounds.meta));
                    zip.folder('backgrounds');

                    backup.backgrounds.full.forEach((file, fileName) => {
                        zip.file(`backgrounds/${fileName}`, file);
                    });
                }

                const zipBlob = await zip.generateAsync({ type: 'blob' });
                const backupPath = '/temp/backup.zip';

                await fs().save(
                    backupPath,
                    new Blob([zipBlob], { type: 'application/zip' }),
                );

                eventToApp('system/backup/local/create/progress', {
                    path: backupPath,
                    stage: 'done',
                });
                this.core.storageService.updatePersistent({ localBackup: 'done' });
            } catch (e) {
                console.error(e);
                captureException(e);
                eventToApp('system/backup/local/create/progress', { stage: 'error' });
                this.core.storageService.updatePersistent({ localBackup: 'failed' });
            }
        });

        this.core.globalBus.on('system/backup/local/restore', async ({ type = 'rigami' }) => {
            console.log('restoreFile:', type);
            this.core.storageService.updatePersistent({ restoreBackup: 'restoring' });

            let backup = {};

            if (type === 'rigami') {
                try {
                    const restoreFile = await fs().get('/temp/restore-backup.rigami', { type: 'blob' });
                    const zip = await new JSZip().loadAsync(restoreFile);
                    const backgrounds = {};
                    const files = map(zip.files, (file) => file);

                    for await (const file of files) {
                        if (
                            [
                                'meta.json',
                                'settings.json',
                                'bookmarks.json',
                                'backgrounds.json',
                            ].includes(file.name)
                        ) {
                            const value = await file.async('text');
                            backup[file.name.slice(0, -5)] = JSON.parse(value);
                        }

                        if (file.name.indexOf('backgrounds/') === -1 || file.dir) continue;

                        backgrounds[file.name.substring(12)] = await file.async('blob');

                        backup.backgroundsFiles = backgrounds;
                    }
                } catch (e) {
                    captureException(e);
                    await fs().rmrf(`/temp/restore-backup.${type}`).catch(console.warn);
                    eventToApp('system/backup/local/restore/progress', {
                        result: 'error',
                        message: 'brokenFile',
                    });
                    this.core.storageService.updatePersistent({
                        restoreBackup: 'error',
                        restoreBackupError: 'brokenFile',
                    });

                    return;
                }
            } else if (type === 'json' || type === 'ctbup') {
                try {
                    const restoreData = await fs().get(`/temp/restore-backup.${type}`, { type: 'text' });
                    let file = JSON.parse(restoreData);

                    if (type === 'ctbup') {
                        file = convertClockTabToRigami(file);
                    }

                    backup = { ...file };
                } catch (e) {
                    captureException(e);
                    await fs().rmrf(`/temp/restore-backup.${type}`).catch(console.warn);
                    eventToApp('system/backup/local/restore/progress', {
                        result: 'error',
                        message: 'brokenFile',
                    });
                    this.core.storageService.updatePersistent({
                        restoreBackup: 'error',
                        restoreBackupError: 'brokenFile',
                    });

                    return;
                }
            } else {
                await fs().rmrf(`/temp/restore-backup.${type}`).catch((e) => {
                    console.warn(e);
                    captureException(e);
                });
                eventToApp('system/backup/local/restore/progress', {
                    result: 'error',
                    message: 'wrongSchema',
                });
                this.core.storageService.updatePersistent({
                    restoreBackup: 'error',
                    restoreBackupError: 'wrongSchema',
                });

                return;
            }

            await fs().rmrf(`/temp/restore-backup.${type}`)
                .catch((e) => {
                    console.warn(e);
                    captureException(e);
                });
            console.log('restore backup', backup);

            try {
                if (backup.meta.version > 4) {
                    eventToApp('system/backup/local/restore/progress', {
                        result: 'error',
                        message: 'wrongVersion',
                    });
                    this.core.storageService.updatePersistent({
                        restoreBackup: 'error',
                        restoreBackupError: 'wrongSchema',
                    });

                    return;
                }

                if (backup.settings) await this.core.settingsService.restore(backup.settings);
                if (backup.bookmarks) await this.core.bookmarksSyncService.restore(backup.bookmarks);
                if (backup.backgrounds) {
                    await this.core.backgroundsSyncService.restore(
                        backup.backgrounds.all,
                        backup.backgroundsFiles,
                    );
                }
                eventToApp('system/backup/local/restore/progress', { result: 'done' });
                this.core.storageService.updatePersistent({ restoreBackup: 'done' });
            } catch (e) {
                console.error(e);
                captureException(e);
                eventToApp('system/backup/local/restore/progress', {
                    result: 'error',
                    message: 'brokenFile',
                });
                this.core.storageService.updatePersistent({
                    restoreBackup: 'error',
                    restoreBackupError: 'brokenFile',
                });
            }
        });
    }

    collectSettings() {
        return fs().get('/settings.json', { type: 'text' })
            .then((props) => {
                console.log(props);

                return { ...JSON.parse(props) };
            })
            .catch((e) => {
                console.error(e);
                captureException(e);

                return {};
            });
    }

    async collectBookmarks() {
        const { all: bookmarksAll } = await BookmarksUniversalService.query();

        const bookmarks = await Promise.all(bookmarksAll.map(async (bookmark) => {
            let image;

            try {
                image = await fs().get(`/bookmarksIcons/${bookmark.icoFileName}`, { type: 'base64' });
            } catch (e) {
                captureException(e);
                console.warn('Failed get icon', e, bookmark);
            }

            return {
                ...omit(bookmark, ['icoFileName', 'imageUrl']),
                image,
            };
        }));

        const tagsAll = await TagsUniversalService.getAll();

        const tags = tagsAll.map((tag) => new Tag(tag));

        const foldersAll = await FoldersUniversalService.getTree();

        const folders = foldersAll.map((folder) => new Folder(folder));

        const favoritesAll = await FavoritesUniversalService.getAll();

        console.log('favoritesAll', favoritesAll);

        const favorites = favoritesAll;

        return {
            bookmarks,
            favorites,
            tags,
            folders,
        };
    }

    async collectBackgrounds() {
        const allBackgrounds = await BackgroundsUniversalService.getAll();

        const meta = [];
        const fullBlobs = new Map();

        for await (const background of allBackgrounds) {
            console.log(background);

            const full = await fs().get(`/backgrounds/full/${background.fileName}`, { type: 'blob' });
            console.log('full:', full);

            fullBlobs.set(background.id, full);

            meta.push(omit(background, [
                'fullSrc',
                'previewSrc',
                'isLoad',
                'isSaved',
                'fileName',
                'id',
            ]));
        }

        return {
            meta: { all: meta },
            full: fullBlobs,
        };
    }
}

export default LocalBackupService;
