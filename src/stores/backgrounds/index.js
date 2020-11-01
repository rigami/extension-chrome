import { action, reaction, makeAutoObservable } from 'mobx';
import appVariables from '@/config/appVariables';
import { BG_TYPE, BG_CHANGE_INTERVAL_MILLISECONDS, BG_SELECT_MODE } from '@/enum';
import DBConnector from '@/utils/dbConnector';
import FSConnector from '@/utils/fsConnector';
import getPreview from '@/utils/createPreview';
import { BackgroundSettingsStore } from '@/stores/app/settings';

export const ERRORS = {
    TOO_MANY_FILES: 'TOO_MANY_FILES',
    NO_FILES: 'NO_FILES',
    ID_BG_IS_CHANGED: 'ID_BG_IS_CHANGED',
};

class BackgroundsStore {
    currentBGId;
    uploadQueue = [];
    bgState = 'pending';
    count;
    settings;
    _currentBG;
    _FULL_PATH = '/backgrounds/full';
    _coreService;

    constructor(coreService) {
        makeAutoObservable(this);
        this._coreService = coreService;
        this.settings = new BackgroundSettingsStore();

        try {
            if (
                this._coreService.storage.persistent.bgNextSwitchTimestamp > Date.now()
                || this.settings.selectionMethod === BG_SELECT_MODE.SPECIFIC
            ) {
                this._currentBG = this._coreService.storage.persistent.bgCurrent;
                this.bgState = this._coreService.storage.persistent.bgCurrent.pause ? 'pause' : 'play';
                this.currentBGId = this._currentBG.id;
            } else {
                this.nextBG();
            }
        } catch (e) {
            console.error(e);
            this.nextBG();
        }

        DBConnector().count('backgrounds')
            .then((value) => { this.count = value; })
            .catch((e) => console.error('Failed get store or value', e));

        reaction(
            () => this.settings.type,
            () => this.nextBG(),
        );
        reaction(
            () => this.settings.changeInterval,
            () => this.nextBG(),
        );
        reaction(
            () => this._coreService.storage.persistent?.bgCurrent?.id,
            () => {
                this._currentBG = this._coreService.storage.persistent.bgCurrent;
                this.bgState = this._coreService.storage.persistent.bgCurrent.pause ? 'pause' : 'play';
                this.currentBGId = this._currentBG.id;
            },
        );
    }

    @action('get current bg')
    getCurrentBG() {
        return this._currentBG;
    }

    @action('play bg')
    play() {
        this._currentBG = {
            ...this._currentBG,
            pause: false,
        };
        this.bgState = 'play';

        this._coreService.storage.updatePersistent({ bgCurrent: { ...this._currentBG } });
        FSConnector.removeFile(this._FULL_PATH, 'temporaryVideoFrame').catch(() => {});

        return this._currentBG;
    }

    @action('pause bg')
    async pause(captureBgId, timestamp) {
        if (captureBgId !== this.currentBGId) return Promise.reject(ERRORS.ID_BG_IS_CHANGED);

        this._currentBG = {
            ...this._currentBG,
            pause: timestamp,
        };
        this.bgState = 'pause';

        this._coreService.storage.updatePersistent({ bgCurrent: { ...this._currentBG } });
        const frame = await getPreview(
            FSConnector.getBGURL(this._currentBG.fileName),
            this._currentBG.type,
            {
                size: 'full',
                timeStamp: timestamp,
            },
        );

        if (captureBgId !== this.currentBGId) throw ERRORS.ID_BG_IS_CHANGED;

        await FSConnector.saveFile(this._FULL_PATH, frame, 'temporaryVideoFrame');

        return this._currentBG;
    }

    @action('next bg')
    async nextBG() {
        const countBG = await DBConnector().count('backgrounds');

        const bgPos = countBG > 1 ? Math.max(Math.floor(Math.random() * (countBG - 1)), 0) + 1 : -1;

        let index = 0;
        let cursor = await DBConnector().transaction('backgrounds').store.openCursor();

        let bg;

        while (cursor) {
            if (index === 0) bg = cursor.value;
            if (cursor.key !== this.currentBGId) index += 1;
            if (bgPos === index) {
                bg = cursor.value;
                break;
            }
            cursor = await cursor.continue();
        }

        if (bg) await this.setCurrentBG(bg.id);
    }

    @action('set current bg')
    async setCurrentBG(currentBGId) {
        if (this.currentBGId === currentBGId) return Promise.resolve();

        if (!currentBGId) {
            this._currentBG = null;
            this.currentBGId = null;
        }

        const bg = await DBConnector().get('backgrounds', currentBGId);

        this._currentBG = bg;
        this.currentBGId = this._currentBG.id;

        this._coreService.storage.updatePersistent({
            bgNextSwitchTimestamp: Date.now() + BG_CHANGE_INTERVAL_MILLISECONDS[this.settings.changeInterval],
            bgCurrent: { ...bg },
        });

        return Promise.resolve();
    }

    @action('add bg`s to queue')
    addToUploadQueue(fileList) {
        if (!fileList || fileList.length === 0) return Promise.reject(ERRORS.NO_FILES);

        if (fileList.length > appVariables.maxUploadFiles) return Promise.reject(ERRORS.TOO_MANY_FILES);

        const uploadTimestamp = Date.now().toString();

        const getNextPreview = () => {
            const bg = this.uploadQueue.find(({ preview }) => preview === 'pending');

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

        return Promise.all(Array.prototype.map.call(fileList, (file, index) => ({
            id: `${uploadTimestamp}-${index}`,
            preview: 'pending',
            previewUrl: null,
            type: ~file.type.indexOf('video') ? [BG_TYPE.VIDEO] : [BG_TYPE.IMAGE, BG_TYPE.ANIMATION],
            size: file.size,
            format: file.type.substring(file.type.indexOf('/') + 1),
            name: file.name,
            file,
        }))).then((bgs) => {
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

        return FSConnector.saveFile(this._FULL_PATH, saveBG.file, saveBGId)
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
                this.count += 1;
            });
    }

    @action('remove bg from store')
    removeFromStore(removeBGId) {
        let fileName;

        return DBConnector().get('backgrounds', removeBGId)
            .then((value) => {
                if (!value) throw new Error('Not find in db');

                fileName = value.fileName;
            })
            .then(() => DBConnector().delete('backgrounds', removeBGId))
            .then(() => {
                this.count -= 1;
                console.log('remove from db');
            })
            .catch((e) => console.error(e))
            .then(() => FSConnector.removeFile(`/backgrounds/full/${fileName}`))
            .then(() => FSConnector.removeFile(`/backgrounds/preview/${fileName}`))
            .catch((e) => console.error(e));
    }

    @action('get srcs')
    getSrcs(options = {}) {
        return DBConnector().getAll('backgrounds')
            .then((values) => values.map(({ fileName }) => FSConnector.getBGURL(fileName, options.type || 'preview')));
    }

    @action('get all')
    getAll() {
        return DBConnector().getAll('backgrounds');
    }
}

export default BackgroundsStore;
