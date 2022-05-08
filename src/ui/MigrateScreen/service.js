import { makeAutoObservable } from 'mobx';
import { cloneDeep } from 'lodash';
import Wallpaper from '@/stores/universal/wallpapers/entities/wallpaper';
import { BG_SOURCE, BKMS_VARIANT } from '@/enum';
import appVariables from '@/config/config';
import WallpapersUniversalService from '@/stores/universal/wallpapers/service';
import cacheManager from '@/utils/cacheManager';
import db from '@/utils/db';
import { search } from '@/stores/universal/workingSpace/search';
import Bookmark from '@/stores/universal/workingSpace/entities/bookmark';

class MigrationService {
    progress = 0;
    _coreService;
    _appStateService;
    _workingSpaceService;

    constructor({ coreService, appStateService, workingSpaceService }) {
        makeAutoObservable(this);

        this._coreService = coreService;
        this._appStateService = appStateService;
        this._workingSpaceService = workingSpaceService;
        this.progress = coreService.storage.data?.migrateToMv3Progress?.percent || 0;
    }

    async _migrateFromStorageViaLocalStorage() {
        if (localStorage.getItem('storage')) {
            const storage = JSON.parse(localStorage.getItem('storage'));

            this._coreService.storage.update({
                ...storage,
                bgCurrent: storage.bgCurrent ? new Wallpaper({
                    ...storage.bgCurrent,
                    isSaved: true,
                    fullSrc: storage.bgCurrent.source === BG_SOURCE.USER
                        ? `${appVariables.rest.url}/background/user?src=${storage.bgCurrent.id}`
                        : storage.bgCurrent.downloadLink,
                    previewSrc: `${appVariables.rest.url}/background/user/get-preview?id=${storage.bgCurrent.id}`,
                }) : null,
                bgsStream: (storage.bgsStream || []).map((bg) => new Wallpaper({
                    ...storage.bgCurrent,
                    isSaved: true,
                    fullSrc: bg.source === BG_SOURCE.USER
                        ? `${appVariables.rest.url}/background/user?src=${bg.id}`
                        : bg.downloadLink,
                    previewSrc: `${appVariables.rest.url}/background/user/get-preview?id=${bg.id}`,
                })),
            });
        }
    }

    async _migrateSettingsViaLocalStorage() {
        if (localStorage.getItem('settings')) {
            const settings = JSON.parse(localStorage.getItem('settings'));

            this._workingSpaceService.settings.update(settings.bookmarks);
            this._appStateService.wallpapersService.settings.update(settings.backgrounds);
            this._appStateService.widgetsService.settings.update(settings.widgets);
            this._appStateService.settings.update(settings.app);
        }
    }

    async _migrateFromFS() {
        const fs = await new Promise((resolve, reject) => {
            navigator.webkitPersistentStorage.requestQuota(
                1024 * 1024 * 1024,
                (grantedBytes) => window.webkitRequestFileSystem(window.PERSISTENT, grantedBytes, resolve, reject),
                reject,
            );
        });

        const getFile = async (path) => {
            const file = await new Promise((resolve, reject) => {
                fs.root.getFile(path, { }, resolve, reject);
            });

            return new Promise(((resolve) => file.file(resolve)));
        };

        let existFolders;

        try {
            existFolders = await new Promise((resolve, reject) => {
                fs.root.getDirectory('bookmarksIcons', { }, (dir) => resolve(dir), reject);
            });
        } catch (e) {
            existFolders = false;
        }

        if (existFolders) {
            const allBackgrounds = await WallpapersUniversalService.getAll();
            let index = 0;

            for await (const wallpaper of allBackgrounds) {
                index += 1;
                this.progress = 25 + 50 * (index / allBackgrounds.length);

                try {
                    let fullSrc;

                    if (wallpaper.source === BG_SOURCE.USER) {
                        fullSrc = `${appVariables.rest.url}/background/user?src=${wallpaper.id}`;
                        const fullBlob = await getFile(`backgrounds/full/${wallpaper.fileName}`);

                        await cacheManager.cache('wallpapers', fullSrc, fullBlob);
                    } else {
                        fullSrc = wallpaper.downloadLink;
                        await cacheManager.cache('wallpapers', fullSrc);
                    }

                    const previewSrc = `${appVariables.rest.url}/background/user/get-preview?id=${wallpaper.id}`;
                    const previewBlob = await getFile(`backgrounds/preview/${wallpaper.fileName}`);

                    await cacheManager.cache('wallpapers-preview', previewSrc, previewBlob);

                    await db().put('wallpapers', cloneDeep(new Wallpaper({
                        ...wallpaper,
                        isSaved: true,
                        fullSrc,
                        previewSrc,
                    })));
                } catch (e) {
                    console.error(e);
                }

                console.log('wallpaper:', wallpaper);
            }

            const { all: allBookmarks } = await search();
            index = 0;

            for await (const bookmark of allBookmarks) {
                index += 1;
                this.progress = 75 + 20 * (index / allBookmarks.length);
                console.log('bookmark check:', bookmark);

                if (bookmark.icoVariant !== BKMS_VARIANT.SYMBOL) {
                    const iconSrc = `${appVariables.rest.url}/background/get-site-icon?site-url=${bookmark.url}`;
                    let iconBlob;

                    try {
                        iconBlob = await getFile(`bookmarksIcons/${bookmark.icoFileName}`);
                        await cacheManager.cache('icons', iconSrc, iconBlob);
                    } catch (e) {
                        console.warn(e);
                    }

                    await db().put('bookmarks', cloneDeep(new Bookmark({
                        ...bookmark,
                        icoVariant: iconBlob ? bookmark.icoVariant : BKMS_VARIANT.SYMBOL,
                        icoUrl: iconSrc,
                    })));
                }

                console.log('bookmark:', bookmark);
            }

            try {
                await Promise.allSettled(
                    ['backgrounds', 'bookmarksIcons', 'temp']
                        .map((path) => new Promise((resolve, reject) => {
                            fs.root.getDirectory(path, {}, (dir) => dir.removeRecursively(resolve, reject), reject);
                        })),
                );
            } catch (e) {
                console.warn(e);
            }
        }
    }

    async migrate() {
        this.progress = 0;

        await this._migrateFromStorageViaLocalStorage();
        await this._migrateSettingsViaLocalStorage();

        this.progress = 25;

        await this._migrateFromFS();

        const migrateToMv3 = await db().getFromIndex('temp', 'name', 'migrate-to-mv3-require');

        if (migrateToMv3) await db().delete('temp', migrateToMv3.id);

        this._coreService.storage.update({ migrateToMv3Progress: null });

        this.progress = 97;

        localStorage.removeItem('storage');
        localStorage.removeItem('settings');

        this._appStateService.settings.recalc();

        this.progress = 100;
    }
}

export default MigrationService;
