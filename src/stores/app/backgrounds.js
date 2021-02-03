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
import DBConnector from '@/utils/dbConnector';
import getPreview from '@/utils/createPreview';
import { BackgroundSettingsStore } from '@/stores/app/settings';
import Background from '@/stores/universal/backgrounds/entities/background';
import { eventToBackground } from '@/stores/server/bus';
import BackgroundsUniversalService, { ERRORS } from '@/stores/universal/backgrounds/service';

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
        this.settings = new BackgroundSettingsStore();

        this._coreService.globalEventBus.on('backgrounds/state', ({ state }) => {
            this.bgState = state;
        });

        const setCurrentBg = (setBG, prepareNextEvent = true) => {
            const bg = new Background({
                ...setBG,
                id: setBG.originId,
            });

            console.log('[backgrounds] Change current background:', bg);

            this._currentBG = bg;
            this.currentBGId = this._currentBG?.id;

            this._coreService.storage.updatePersistent({
                bgCurrent: { ...bg },
            });

            if (prepareNextEvent) eventToBackground('backgrounds/prepareNextBg');
        }

        reaction(
            () => this._coreService.storage.persistent?.bgCurrent?.id,
            () => {
                if (this._coreService.storage.persistent.bgCurrent) {
                    setCurrentBg(this._coreService.storage.persistent.bgCurrent);
                }
            },
        );

        reaction(
            () => this._coreService.storage.persistent?.bgShowMode,
            () => {
                this.bgShowMode = this._coreService.storage.persistent?.bgShowMode;
            },
        );

        reaction(
            () => this._coreService.storage.persistent?.bgCurrent?.pauseStubSrc,
            () => {
                if (this._coreService.storage.persistent.bgCurrent) {
                    this._currentBG = this._coreService.storage.persistent.bgCurrent;
                }
            },
        );
        reaction(
            () => this._coreService.storage.persistent?.bgCurrent?.pauseTimestamp,
            () => {
                if (this._coreService.storage.persistent.bgCurrent) {
                    this._currentBG = this._coreService.storage.persistent.bgCurrent;
                }
            },
        );

        if (this._coreService.storage.persistent?.bgCurrent) {
            setCurrentBg(this._coreService.storage.persistent.bgCurrent, false);
        }
        this.bgShowMode = this._coreService.storage.persistent?.bgShowMode || BG_SHOW_MODE.LIVE;

        this._coreService.globalEventBus.on('backgrounds/new', ({ bg }) => {
            setCurrentBg(bg, false);
        });

        this._coreService.globalEventBus.on('backgrounds/remove', ({ bg }) => {

        });

        if (
            this.settings.selectionMethod !== BG_SELECT_MODE.SPECIFIC
            && this.settings.changeInterval === BG_CHANGE_INTERVAL.OPEN_TAB
        ) eventToBackground('backgrounds/nextBg');
    }

    @action('')
    setBG(bg) {
        return new Promise(((resolve) => eventToBackground('backgrounds/setBg', { bg }, resolve)));
    }

    @computed
    get currentBG() {
        return this._currentBG;
    }

    @action('add bg`s to queue')
    addToUploadQueue(fileList) {
        if (!fileList || fileList.length === 0) return Promise.reject(ERRORS.NO_FILES);

        if (fileList.length > appVariables.maxUploadFiles) return Promise.reject(ERRORS.TOO_MANY_FILES);

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
                .catch((e) => console.error(e));
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
        });

        console.log('saveFromUploadQueue', saveBGId, saveBG, options, this.uploadQueue.find(({ id }) => saveBGId === id))

        return BackgroundsUniversalService.addToLibrary(saveBG)
            .finally(() => {
                this.uploadQueue = this.uploadQueue.filter(({ id }) => saveBGId !== id);
            });
    }

    @action('get last usage backgrounds')
    async getLastUsage(limit = 10) {
        let tx = await DBConnector().transaction('backgrounds', 'readonly');
        let cursor = await tx.objectStore('backgrounds').openCursor();
        let currIndex = 0;
        let bgs = [];

        while (cursor && currIndex + 1 < limit) {
            bgs.push(new Background(cursor.value))

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
