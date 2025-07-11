import { makeAutoObservable, toJS } from 'mobx';
import { forEach, map, omit } from 'lodash';
import JSZip from 'jszip';
import { captureException } from '@sentry/browser';
import appVariables from '@/config/config';
import { eventToApp } from '@/stores/universal/serviceBus';
import StorageConnector from '@/stores/universal/storage/connector';
import { BG_TYPE } from '@/enum';
import WorkingSpace from '@/stores/server/localBackup/workingSpace';
import Wallpapers from '@/stores/server/localBackup/wallpapers';
import migrationClockTabTo5 from './migration/clockTab_5';
import migration5To6 from './migration/5_6';
import migration4To5 from './migration/4_5';
import consoleBinder from '@/utils/console/bind';
import settingsStorage from '@/stores/universal/settings/rootSettings';
import createBackupFile from '@/stores/server/localBackup/createBackupFile';
import cacheManager from '@/utils/cacheManager';

const bindConsole = consoleBinder('local-backup');

class LocalBackupService {
    core;
    workingSpaceService;
    wallpapersService;

    constructor(core) {
        makeAutoObservable(this);
        this.core = core;

        this.subscribe();
    }

    async createBackup({ settings, workingSpace, wallpapers }) {
        eventToApp('system/backup/local/create/progress', { stage: 'start' });
        this.core.storage.update({ localBackup: 'creating' });

        console.log('system/backup/local/create:', {
            settings,
            workingSpace,
            wallpapers,
        });

        try {
            let backup = {};

            if (settings) {
                backup.settings = omit(toJS(settingsStorage.data), ['updateTimestamp']);
            }

            backup.storage = omit((await StorageConnector.get('storage')).storage || {}, [
                'localBackup',
                'restoreBackup',
                'restoreBackupError',
                'lastUsageVersion',
                'factoryResetProgress',
                'wallpaperState',
                'updateTimestamp',
            ]);

            if (BUILD === 'full' && workingSpace) {
                const workingSpaceData = await this.workingSpaceService.collect();

                backup = {
                    ...backup,
                    ...workingSpaceData,
                };
            }

            if (wallpapers) {
                backup.wallpapers = await this.wallpapersService.collect();
            }

            console.log('backup:', backup);

            const zipBlob = await createBackupFile(backup);

            await cacheManager.cache('temp', `${appVariables.rest.url}/temp/backup.zip`, zipBlob);

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

    async readModern(rawBackup) {
        const backup = {};
        const restoreFile = await rawBackup.blob();
        const zip = await new JSZip().loadAsync(restoreFile);
        const backgrounds = {};
        const previews = {};
        const files = map(zip.files, (file) => file);

        for await (const file of files) {
            console.log('file', file);
            if (
                [
                    'meta.json',
                    'storage.json',
                    'settings.json',
                    'workingSpace.json',
                    'wallpapers.json',
                    // Old fields
                    'backgrounds.json',
                    'bookmarks.json',
                ].includes(file.name)
            ) {
                const value = await file.async('text');
                backup[file.name.slice(0, -5)] = JSON.parse(value);
            }

            if (file.name.indexOf('wallpapers/') !== -1 && !file.dir) {
                const fileName = file.name.substring(file.name.indexOf('/') + 1);
                const splitIndex = fileName.indexOf('.');
                const id = splitIndex === -1 ? fileName : fileName.substring(0, splitIndex);
                const ext = splitIndex === -1 ? '' : fileName.substring(splitIndex + 1);

                const bgType = backup.wallpapers.all
                    .find((wallpaper) => wallpaper.id === id)
                    .type;
                const blob = await file.async('blob');

                backgrounds[id] = new Blob(
                    [blob],
                    { type: `${bgType === BG_TYPE.VIDEO ? 'video' : 'image'}/${ext}` },
                );
            } else if (file.name.indexOf('backgrounds/') !== -1 && !file.dir) {
                const fileName = file.name.substring(file.name.indexOf('/') + 1);
                const splitIndex = fileName.indexOf('.');
                const id = splitIndex === -1 ? fileName : fileName.substring(0, splitIndex);
                const ext = splitIndex === -1 ? '' : fileName.substring(splitIndex + 1);

                const bg = backup.backgrounds.all
                    .find((wallpaper) => `${wallpaper.source.toLowerCase()}-${wallpaper.originId}` === id);
                const blob = await file.async('blob');

                backgrounds[bg.id] = new Blob(
                    [blob],
                    { type: `${bg.type === BG_TYPE.VIDEO ? 'video' : 'image'}/${ext}` },
                );
            } else if (file.name.indexOf('wallpaperPreviews/') !== -1 && !file.dir) {
                const fileName = file.name.substring(file.name.indexOf('/') + 1);
                const splitIndex = fileName.indexOf('.');
                const id = fileName.substring(0, splitIndex);
                const blob = await file.async('blob');

                previews[id] = new Blob([blob], { type: 'image/jpeg' });
            } else if (file.name.indexOf('previews/') !== -1 && !file.dir) {
                const fileName = file.name.substring(file.name.indexOf('/') + 1);
                const splitIndex = fileName.indexOf('.');
                const id = fileName.substring(0, splitIndex);

                const bg = backup.backgrounds.all
                    .find((wallpaper) => `${wallpaper.source.toLowerCase()}-${wallpaper.originId}` === id);
                const blob = await file.async('blob');

                previews[bg.id] = new Blob([blob], { type: 'image/jpeg' });
            }
        }

        backup.wallpaperFiles = backgrounds;
        backup.wallpaperPreviewFiles = previews;

        return backup;
    }

    async readLegacy(rawBackup, type) {
        const restoreData = await rawBackup.text();
        let file = JSON.parse(restoreData);

        if (type === 'ctbup') {
            file = migrationClockTabTo5(file);
        }

        return { ...file };
    }

    async restoreBackup({ type = 'rigami', path }) {
        bindConsole.log(`Restore file type:${type} path:${path}...`);
        this.core.storage.update({ restoreBackup: 'restoring' });

        const rawBackup = await cacheManager.get('temp', path);

        let backup = {};

        bindConsole.log('Raw backup file:', rawBackup);

        await cacheManager.delete('temp', path);

        try {
            if (type === 'rigami') {
                backup = await this.readModern(rawBackup);
            } else if (type === 'json' || type === 'ctbup') {
                backup = await this.readLegacy(rawBackup, type);
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
        } catch (e) {
            bindConsole.error(e);
            captureException(e);
            eventToApp('system/backup/local/restore/progress', {
                result: 'error',
                message: 'brokenFile',
            });
            this.core.storage.update({
                restoreBackup: 'error',
                restoreBackupError: 'brokenFile',
            });

            return;
        }

        bindConsole.log('Backup file raw:', backup);

        if (backup.meta.version === 4) {
            backup = migration4To5(backup);
        }

        if (backup.meta.version === 5) {
            backup = migration5To6(backup);
        }

        bindConsole.log('Backup file:', backup);

        try {
            if (backup.meta.version !== appVariables.backup.version) {
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

            if (backup.storage) {
                this.core.storage.update(backup.storage, true);
            }

            if (backup.settings) {
                this.core.settingsService.settingsStorage.updateRaw(backup.settings, true);
            }

            if (BUILD === 'full' && backup.workingSpace) {
                await this.workingSpaceService.restore(backup.workingSpace);
            }

            if (backup.wallpapers) {
                await this.wallpapersService.restore(
                    backup.wallpapers.all,
                    backup.wallpaperFiles,
                    backup.wallpaperPreviewFiles,
                );
            }
            this.core.storage.update({ restoreBackup: 'done' }, true);
            eventToApp('system/backup/local/restore/progress', { result: 'done' });
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
        if (BUILD === 'full') { this.workingSpaceService = new WorkingSpace(this); }
        this.wallpapersService = new Wallpapers(this);

        this.core.globalEventBus.on('system/backup/local/create', ({ data: { settings, workingSpace, wallpapers } }) => {
            this.createBackup({
                settings,
                workingSpace,
                wallpapers,
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
