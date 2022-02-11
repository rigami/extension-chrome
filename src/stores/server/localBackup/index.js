import { makeAutoObservable } from 'mobx';
import { map } from 'lodash';
import JSZip from 'jszip';
import { captureException } from '@sentry/browser';
import appVariables from '@/config/config';
import { eventToApp } from '@/stores/universal/serviceBus';

import StorageConnector from '@/stores/universal/storage/connector';
import { BG_TYPE } from '@/enum';
import SyncBookmarks from '@/stores/server/localBackup/syncBookmarks';
import SyncBackgrounds from '@/stores/server/localBackup/syncBackgrounds';
import convertBackupClockTabToRigamiFormat from '../utils/convertBackupClockTabToRigamiFormat';

class LocalBackupService {
    core;
    bookmarksSyncService;
    backgroundsSyncService;

    constructor(core) {
        makeAutoObservable(this);
        this.core = core;

        this.subscribe();
    }

    async collectSettings() {
        return StorageConnector.get(null);
    }

    async createBackup({ settings, bookmarks, backgrounds }) {
        eventToApp('system/backup/local/create/progress', { stage: 'start' });
        this.core.storage.update({ localBackup: 'creating' });

        console.log('system/backup/local/create:', {
            settings,
            bookmarks,
            backgrounds,
        });

        try {
            const backup = {};

            if (settings) {
                backup.settings = await this.collectSettings();
            }

            if (BUILD === 'full' && bookmarks) {
                backup.bookmarks = await this.bookmarksSyncService.collect();
            }

            if (backgrounds) {
                backup.backgrounds = await this.backgroundsSyncService.collect();
            }

            backup.meta = {
                date: new Date().toISOString(),
                appVersion: appVariables.version,
                appType: 'extension.chrome',
                version: appVariables.backup.version,
            };

            console.log('Backup:', backup);

            const zip = new JSZip();

            zip.file('meta.json', JSON.stringify(backup.meta));
            if (settings) zip.file('settings.json', JSON.stringify(backup.settings));
            if (BUILD === 'full' && bookmarks) zip.file('bookmarks.json', JSON.stringify(backup.bookmarks));
            if (backgrounds) {
                zip.file('wallpapers.json', JSON.stringify(backup.backgrounds.meta));
                zip.folder('backgrounds');
                zip.folder('previews');

                backup.backgrounds.full.forEach((file, fileName) => {
                    zip.file(`backgrounds/${fileName}`, file);
                });

                backup.backgrounds.preview.forEach((file, fileName) => {
                    zip.file(`previews/${fileName}`, file);
                });
            }

            const zipBlob = await zip.generateAsync({ type: 'blob' });

            const cache = await caches.open('temp');

            const zipResponse = new Response(zipBlob);

            await cache.put(`${appVariables.rest.url}/temp/backup.zip`, zipResponse);

            eventToApp('system/backup/local/create/progress', {
                path: `${appVariables.rest.url}/temp/backup.zip`,
                stage: 'done',
            });
            this.core.storage.update({ localBackup: 'done' });
        } catch (e) {
            console.error(e);
            captureException(e);
            eventToApp('system/backup/local/create/progress', { stage: 'error' });
            this.core.storage.update({ localBackup: 'failed' });
        }
    }

    async restoreRigami(rawBackup) {
        const backup = {};

        try {
            const restoreFile = await rawBackup.blob();
            const zip = await new JSZip().loadAsync(restoreFile);
            const backgrounds = {};
            const previews = {};
            const files = map(zip.files, (file) => file);

            for await (const file of files) {
                if (
                    [
                        'meta.json',
                        'settings.json',
                        'bookmarks.json',
                        'wallpapers.json',
                    ].includes(file.name)
                ) {
                    const value = await file.async('text');
                    backup[file.name.slice(0, -5)] = JSON.parse(value);
                }

                if (file.name.indexOf('wallpapers/') !== -1 && !file.dir) {
                    const fileName = file.name.substring(12);
                    const splitIndex = fileName.indexOf('.');
                    const id = splitIndex === -1 ? fileName : fileName.substring(0, splitIndex);
                    const ext = splitIndex === -1 ? '' : fileName.substring(splitIndex + 1);
                    const bgType = backup.backgrounds.all
                        .find(({ idInSource, source }) => `${source.toLowerCase()}-${idInSource}` === id)
                        .type;
                    const blob = await file.async('blob');

                    backgrounds[id] = new Blob(
                        [blob],
                        { type: `${bgType === BG_TYPE.VIDEO ? 'video' : 'image'}/${ext}` },
                    );
                } else if (file.name.indexOf('previews/') !== -1 && !file.dir) {
                    const fileName = file.name.substring(9);
                    const splitIndex = fileName.indexOf('.');
                    const id = fileName.substring(0, splitIndex);
                    const blob = await file.async('blob');

                    previews[id] = new Blob([blob], { type: 'image/jpeg' });
                }
            }

            backup.backgroundsFiles = backgrounds;
            backup.previewsFiles = previews;
        } catch (e) {
            console.error(e);
            captureException(e);
            eventToApp('system/backup/local/restore/progress', {
                result: 'error',
                message: 'brokenFile',
            });
            this.core.storage.update({
                restoreBackup: 'error',
                restoreBackupError: 'brokenFile',
            });

            return null;
        }

        return backup;
    }

    async restoreLegacy(rawBackup, type) {
        let backup = {};

        try {
            const restoreData = await rawBackup.text();
            let file = JSON.parse(restoreData);

            if (type === 'ctbup') {
                file = convertBackupClockTabToRigamiFormat(file);
            }

            backup = { ...file };
        } catch (e) {
            console.error(e);
            captureException(e);
            eventToApp('system/backup/local/restore/progress', {
                result: 'error',
                message: 'brokenFile',
            });
            this.core.storage.update({
                restoreBackup: 'error',
                restoreBackupError: 'brokenFile',
            });

            return null;
        }

        return backup;
    }

    async restoreBackup({ type = 'rigami', path }) {
        console.log('restoreFile:', type);
        this.core.storage.update({ restoreBackup: 'restoring' });

        const cache = await caches.open('temp');
        const rawBackup = await cache.match(path);

        let backup = {};

        if (type === 'rigami') {
            backup = await this.restoreRigami(rawBackup);
        } else if (type === 'json' || type === 'ctbup') {
            backup = await this.restoreLegacy(rawBackup, type);
        } else {
            eventToApp('system/backup/local/restore/progress', {
                result: 'error',
                message: 'wrongSchema',
            });
            this.core.storage.update({
                restoreBackup: 'error',
                restoreBackupError: 'wrongSchema',
            });

            return;
        }

        console.log('restore backup', backup);

        try {
            if (backup.meta.version > appVariables.backup.version) {
                eventToApp('system/backup/local/restore/progress', {
                    result: 'error',
                    message: 'wrongVersion',
                });
                this.core.storage.update({
                    restoreBackup: 'error',
                    restoreBackupError: 'wrongSchema',
                });

                return;
            }

            if (backup.settings) await StorageConnector.set(backup.settings);
            if (BUILD === 'full' && backup.bookmarks) {
                await this.core.bookmarksSyncService.restore(backup.bookmarks);
            }
            if (backup.backgrounds) {
                await this.core.backgroundsSyncService.restore(
                    backup.backgrounds.all,
                    backup.backgroundsFiles,
                    backup.previewsFiles,
                );
            }
            eventToApp('system/backup/local/restore/progress', { result: 'done' });
            this.core.storage.update({ restoreBackup: 'done' });
        } catch (e) {
            console.error(e);
            captureException(e);
            eventToApp('system/backup/local/restore/progress', {
                result: 'error',
                message: 'brokenFile',
            });
            this.core.storage.update({
                restoreBackup: 'error',
                restoreBackupError: 'brokenFile',
            });
        }
    }

    subscribe() {
        if (BUILD === 'full') { this.bookmarksSyncService = new SyncBookmarks(this); }
        this.backgroundsSyncService = new SyncBackgrounds(this);

        this.core.globalEventBus.on('system/backup/local/create', ({ data: { settings, bookmarks, backgrounds } }) => {
            this.createBackup({
                settings,
                bookmarks,
                backgrounds,
            });
        });

        this.core.globalEventBus.on('system/backup/local/restore', async ({ data: { type = 'rigami', path } }) => {
            this.restoreBackup({
                type,
                path,
            });
        });
    }
}

export default LocalBackupService;
