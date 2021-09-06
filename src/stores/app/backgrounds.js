import {
    action,
    reaction,
    makeAutoObservable,
    computed,
} from 'mobx';
import appVariables from '@/config/appVariables';
import {
    BG_TYPE,
    BG_SHOW_MODE,
    BG_SHOW_STATE,
    FETCH,
    BG_CHANGE_INTERVAL,
    BG_SELECT_MODE,
} from '@/enum';
import db from '@/utils/db';
import getPreview from '@/utils/createPreview';
import { BackgroundsSettings } from '@/stores/universal/settings';
import Background from '@/stores/universal/backgrounds/entities/background';
import { eventToBackground } from '@/stores/universal/serviceBus';
import BackgroundsUniversalService, { ERRORS } from '@/stores/universal/backgrounds/service';
import { captureException } from '@sentry/react';

class BackgroundsAppService {
    currentBGId;
    uploadQueue = [];
    bgShowMode = BG_SHOW_MODE.LIVE;
    bgState = BG_SHOW_STATE.DONE;
    settings;
    _currentBG;
    _coreService;

    constructor(coreService) {
        makeAutoObservable(this);
        this._coreService = coreService;
        this.settings = new BackgroundsSettings();

        this._coreService.globalEventBus.on('backgrounds/state', ({ data: state }) => {
            console.log('[backgrounds] Change background state:', state);
            this.bgState = state;
        });

        const setCurrentBg = (setBG) => {
            console.log('setCurrentBg:', setBG);
            const bg = new Background({
                ...setBG,
                id: setBG.originId,
            });

            if (this._currentBG) console.log('[backgrounds] Change current background:', bg);
            else console.log('[backgrounds] Set current background:', bg);

            this._currentBG = bg;
            this.currentBGId = this._currentBG?.id;

            // this._coreService.storage.persistent.update({ bgCurrent: { ...bg } });
        };

        reaction(
            () => this._coreService.storage.persistent.data.bgCurrent?.id,
            () => {
                if (this._coreService.storage.persistent.data.bgCurrent) {
                    setCurrentBg(this._coreService.storage.persistent.data.bgCurrent);
                }
            },
        );

        reaction(
            () => this._coreService.storage.persistent.data.bgShowMode,
            () => {
                this.bgShowMode = this._coreService.storage.persistent.data.bgShowMode;
            },
        );

        reaction(
            () => this._coreService.storage.persistent.data.bgCurrent?.pauseStubSrc,
            () => {
                if (this._coreService.storage.persistent.bgCurrent) {
                    this._currentBG = this._coreService.storage.persistent.bgCurrent;
                }
            },
        );
        reaction(
            () => this._coreService.storage.persistent.data.bgCurrent?.pauseTimestamp,
            () => {
                if (this._coreService.storage.persistent.data.bgCurrent) {
                    this._currentBG = this._coreService.storage.persistent.data.bgCurrent;
                }
            },
        );

        if (this._coreService.storage.persistent.data.bgCurrent) {
            setCurrentBg(this._coreService.storage.persistent.data.bgCurrent);
        }
        this.bgShowMode = this._coreService.storage.persistent.data.bgShowMode || BG_SHOW_MODE.LIVE;

        this._coreService.globalEventBus.on('backgrounds/removed', ({ data: bg }) => {
            if (bg.id === this.currentBGId) eventToBackground('backgrounds/nextBg');
        });

        if (
            this.settings.selectionMethod !== BG_SELECT_MODE.SPECIFIC
            && this.settings.changeInterval === BG_CHANGE_INTERVAL.OPEN_TAB
            && (
                (
                    this.settings.selectionMethod === BG_SELECT_MODE.STREAM
                    && this._coreService.storage.persistent?.data.prepareBGStream
                )
                || this.settings.selectionMethod === BG_SELECT_MODE.RANDOM
            )
        ) {
            eventToBackground('backgrounds/nextBg');
        }
    }

    @action('')
    setBG(bg) {
        return new Promise(((resolve) => eventToBackground('backgrounds/setBg', bg, resolve)));
    }

    @computed
    get currentBG() {
        console.log('this._coreService.storage:', this._coreService.storage, this._coreService.storage.persistent);
        return this._coreService.storage.persistent.data.bgCurrent;
    }

    @action
    async like(bg) {
        const currentBgId = bg.id;
        this._coreService.storage.persistent.update({
            bgCurrent: {
                ...this._coreService.storage.persistent.data.bgCurrent,
                isLiked: true,
                isDisliked: false,
                isSaved: true,
            },
        });

        try {
            await BackgroundsUniversalService.addToLibrary(bg);
        } catch (e) {
            console.error(e);
            captureException(e);
            if (currentBgId === this._coreService.storage.persistent.data.bgCurrent.id) {
                this._coreService.storage.persistent.update({
                    bgCurrent: {
                        ...this._coreService.storage.persistent.bgCurrent,
                        isLiked: false,
                        isSaved: false,
                    },
                });
            }
        }
    }

    @action
    async dislike(bg) {
        const currentBgId = bg.id;
        this._coreService.storage.persistent.update({
            bgCurrent: {
                ...this._coreService.storage.persistent.data.bgCurrent,
                isLiked: false,
                isDisliked: true,
                isSaved: false,
            },
        });

        try {
            await BackgroundsUniversalService.removeFromLibrary(bg);
        } catch (e) {
            console.error(e);
            captureException(e);
            if (currentBgId === this._coreService.storage.persistent.data.bgCurrent.id) {
                this._coreService.storage.persistent.update({
                    bgCurrent: {
                        ...this._coreService.storage.persistent.data.bgCurrent,
                        isDisliked: false,
                        isSaved: false,
                    },
                });
            }
        }
    }

    @action
    async unlike(bg) {
        this._coreService.storage.persistent.update({
            bgCurrent: {
                ...this._coreService.storage.persistent.data.bgCurrent,
                isLiked: false,
                isDisliked: false,
                isSaved: false,
            },
        });

        try {
            await BackgroundsUniversalService.removeFromLibrary(bg, true);
        } catch (e) {
            console.error(e);
            captureException(e);
        }
    }

    @action('add to library')
    async addToLibrary(bg) {
        this._coreService.storage.temp.update({ addingBgToLibrary: FETCH.PENDING });

        try {
            await BackgroundsUniversalService.addToLibrary(bg);
            this._coreService.storage.temp.update({ addingBgToLibrary: FETCH.DONE });
            this._coreService.storage.persistent.update({
                bgCurrent: {
                    ...this._coreService.storage.persistent.data.bgCurrent,
                    isSaved: true,
                },
            });
        } catch (e) {
            console.error(e);
            captureException(e);
            this._coreService.storage.temp.update({ addingBgToLibrary: FETCH.FAILED });
        }
    }

    @action('add bg`s to queue')
    addToUploadQueue(fileList) {
        if (!fileList || fileList.length === 0) return Promise.reject(new Error(ERRORS.NO_FILES));

        if (fileList.length > appVariables.backgrounds.maxUploadFiles) {
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

        const saveBG = new Background({
            ...bg,
            ...{
                antiAliasing: true,
                ...options,
            },
            downloadLink: URL.createObjectURL(bg.file),
            previewLink: URL.createObjectURL(bg.preview),
        });

        return BackgroundsUniversalService.addToLibrary(saveBG)
            .finally(() => {
                this.uploadQueue = this.uploadQueue.filter(({ id }) => saveBGId !== id);
            });
    }

    @action('get last usage backgrounds')
    async getLastUsage(limit = 10) {
        const tx = await db().transaction('backgrounds', 'readonly');
        let cursor = await tx.objectStore('backgrounds').openCursor();
        let currIndex = 0;
        const bgs = [];

        while (cursor && currIndex + 1 < limit) {
            bgs.push(new Background(cursor.value));

            currIndex += 1;
            cursor = await cursor.continue();
        }

        return bgs;
    }

    @action('get all backgrounds')
    getAll() {
        return BackgroundsUniversalService.getAll();
    }
}

export default BackgroundsAppService;
