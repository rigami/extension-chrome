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
    FETCH, BG_CHANGE_INTERVAL_MILLISECONDS,
} from '@/enum';
import DBConnector from '@/utils/dbConnector';
import FSConnector from '@/utils/fsConnector';
import getPreview from '@/utils/createPreview';
import { BackgroundSettingsStore } from '@/stores/app/settings';
import Background from '@/stores/universal/backgrounds/entities/background';
import { eventToBackground } from '@/stores/server/bus';
import BackgroundsUniversalService, { ERRORS } from '@/stores/universal/backgrounds/service';

class BackgroundsAppService {
    currentBGId;
    uploadQueue = [];
    bgMode = BG_SHOW_MODE.LIVE;
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
            this.bgMode = bg.pause ? BG_SHOW_MODE.STATIC : BG_SHOW_MODE.LIVE;
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

        if (this._coreService.storage.persistent?.bgCurrent) {
            setCurrentBg(this._coreService.storage.persistent.bgCurrent);
        }

        this._coreService.globalEventBus.on('backgrounds/new', ({ bg }) => {
            setCurrentBg(bg, false);
        })
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
                computeType = [BG_TYPE.VIDEO];
            } else if (~file.type.indexOf('gif')) {
                computeType = [BG_TYPE.ANIMATION];
                computeAntiAliasing = false;
            } else {
                computeType = [BG_TYPE.IMAGE];
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
        const saveBG = {
            ...this.uploadQueue.find(({ id }) => saveBGId === id),
            ...{
                antiAliasing: true,
                ...options,
            },
        };

        return FSConnector.saveFile(BackgroundsUniversalService.FULL_PATH, saveBG.file, saveBGId)
            .then(() => FSConnector.saveFile('/backgrounds/preview', saveBG.preview, saveBGId))
            .then(() => DBConnector().add('backgrounds', {
                author: 'unknown',
                type: saveBG.type[0],
                fileName: saveBGId,
                description: 'user_background',
                sourceLink: saveBG.name,
                antiAliasing: saveBG.antiAliasing,
            }))
            .then(() => {
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
