import {
    action,
    reaction,
    makeAutoObservable,
    computed,
} from 'mobx';
import { captureException } from '@sentry/react';
import appVariables from '@/config/config';
import {
    BG_TYPE,
    BG_SHOW_MODE,
    BG_SHOW_STATE,
    FETCH,
    BG_CHANGE_INTERVAL,
    BG_SELECT_MODE, BG_RATE,
} from '@/enum';
import db from '@/utils/db';
import getPreview from '@/utils/createPreview';
import WallpapersSettings from '@/stores/universal/settings/wallpapers';
import Wallpaper from '@/stores/universal/wallpapers/entities/wallpaper';
import { eventToBackground } from '@/stores/universal/serviceBus';
import WallpapersUniversalService, { ERRORS } from '@/stores/universal/wallpapers/service';

class WallpapersService {
    currentBGId;
    uploadQueue = [];
    bgShowMode = BG_SHOW_MODE.LIVE;
    bgState;
    settings;
    _coreService;

    constructor(coreService) {
        makeAutoObservable(this);
        this._coreService = coreService;
        this.settings = new WallpapersSettings();
    }

    @action('')
    setWallpaper(wallpaper) {
        return new Promise(((resolve) => eventToBackground('wallpapers/set', wallpaper, resolve)));
    }

    @action('rate')
    async rate(wallpaper, rate) {
        if (rate === BG_RATE.DISLIKE) {
            eventToBackground('wallpapers/rate', {
                wallpaperId: wallpaper?.id,
                rate: BG_RATE.DISLIKE,
            });
            eventToBackground('wallpapers/next');

            await WallpapersUniversalService.removeFromLibrary(wallpaper);
        } else {
            eventToBackground('wallpapers/rate', {
                wallpaperId: wallpaper?.id,
                rate: wallpaper?.isLiked ? null : BG_RATE.LIKE,
            });

            await WallpapersUniversalService.addToLibrary(wallpaper);
        }
    }

    @action('add to library')
    async addToLibrary(bg) {
        this._coreService.tempStorage.update({ addingBgToLibrary: FETCH.PENDING });

        try {
            await WallpapersUniversalService.addToLibrary(bg);
            this._coreService.tempStorage.update({ addingBgToLibrary: FETCH.DONE });
            this._coreService.storage.update({
                bgCurrent: {
                    ...this._coreService.storage.data.bgCurrent,
                    isSaved: true,
                },
            });
        } catch (e) {
            console.error(e);
            captureException(e);
            this._coreService.tempStorage.update({ addingBgToLibrary: FETCH.FAILED });
        }
    }

    @action('add bg`s to queue')
    addToUploadQueue(fileList) {
        if (!fileList || fileList.length === 0) return Promise.reject(new Error(ERRORS.NO_FILES));

        if (fileList.length > appVariables.wallpapers.maxUploadFiles) {
            return Promise.reject(new Error(ERRORS.TOO_MANY_FILES));
        }

        const uploadTimestamp = Date.now().toString();

        const getNextPreview = () => {
            const bg = this.uploadQueue.find(({ preview }) => preview === FETCH.PENDING);

            if (!bg) return;

            getPreview(bg.file)
                .then((previewFile) => {
                    this.uploadQueue = this.uploadQueue.map((mapBg) => {
                        if (bg.id === mapBg.id) {
                            return {
                                ...mapBg,
                                preview: previewFile,
                                previewUrl: URL.createObjectURL(previewFile),
                            };
                        }

                        return mapBg;
                    });
                    getNextPreview();
                })
                .catch((e) => {
                    console.error(e);
                    captureException(e);
                });
        };

        return Promise.all(Array.prototype.map.call(fileList, (file, index) => {
            let computeType;
            let computeAntiAliasing = true;

            if (~file.type.indexOf('video')) {
                computeType = BG_TYPE.VIDEO;
            } else if (~file.type.indexOf('gif')) {
                computeType = BG_TYPE.ANIMATION;
                computeAntiAliasing = false;
            } else {
                computeType = BG_TYPE.IMAGE;
            }

            return {
                id: `${uploadTimestamp}-${index}`,
                preview: FETCH.PENDING,
                previewUrl: null,
                type: computeType,
                size: file.size,
                format: file.type.substring(file.type.indexOf('/') + 1),
                antiAliasing: computeAntiAliasing,
                name: file.name,
                file,
            };
        })).then((bgs) => {
            this.uploadQueue = [...this.uploadQueue, ...bgs];

            getNextPreview();

            return bgs;
        });
    }

    @action('reset upload bg queue')
    resetUploadQueue() {
        this.uploadQueue = [];
    }

    @action('remove bg from queue')
    removeFromUploadQueue(removeBGId) {
        this.uploadQueue = this.uploadQueue.filter(({ id }) => removeBGId !== id);
    }

    @action('save bg`s in store')
    saveFromUploadQueue(saveBGId, options) {
        const bg = this.uploadQueue.find(({ id }) => saveBGId === id);

        console.log('saveFromUploadQueue:', bg);

        const saveBG = new Wallpaper({
            ...bg,
            ...{
                antiAliasing: true,
                ...options,
            },
            fullSrc: URL.createObjectURL(bg.file),
            previewSrc: URL.createObjectURL(bg.preview),
        });

        return WallpapersUniversalService.addToLibrary(
            saveBG,
            {
                fullBlob: bg.file,
                previewBlob: bg.file,
            },
        )
            .finally(() => {
                this.uploadQueue = this.uploadQueue.filter(({ id }) => saveBGId !== id);
            });
    }

    @action('get last usage wallpapers')
    async getLastUsage(limit = 10) {
        const tx = await db().transaction('wallpapers', 'readonly');
        let cursor = await tx.objectStore('wallpapers').openCursor();
        let currIndex = 0;
        const bgs = [];

        while (cursor && currIndex + 1 <= limit) {
            bgs.push(new Wallpaper(cursor.value));

            currIndex += 1;
            cursor = await cursor.continue();
        }

        return bgs;
    }

    @action('get all wallpapers')
    getAll() {
        return WallpapersUniversalService.getAll();
    }
}

export default WallpapersService;
