import { action, reaction, makeAutoObservable } from 'mobx';
import appVariables from '@/config/appVariables';
import {
    BG_TYPE,
    BG_CHANGE_INTERVAL_MILLISECONDS,
    BG_SELECT_MODE,
    BG_SOURCE,
} from '@/enum';
import DBConnector from '@/utils/dbConnector';
import FSConnector from '@/utils/fsConnector';
import getPreview from '@/utils/createPreview';
import { BackgroundSettingsStore } from '@/stores/app/settings';
import Background from './background';
import createPreview from '@/utils/createPreview';
import fetchData from '@/utils/xhrPromise';
import { first } from 'lodash';

export const ERRORS = {
    TOO_MANY_FILES: 'TOO_MANY_FILES',
    NO_FILES: 'NO_FILES',
    ID_BG_IS_CHANGED: 'ID_BG_IS_CHANGED',
};

export const BG_STATE = {
    WAIT: 'WAIT',
    SEARCH: 'SEARCH',
    DONE: 'DONE',
    NOT_FOUND: 'NOT_FOUND',
};

export const BG_MODE = {
    STATIC: 'STATIC',
    LIVE: 'LIVE',
};

class BackgroundsStore {
    currentBGId;
    uploadQueue = [];
    bgMode = BG_MODE.LIVE;
    bgState = BG_STATE.WAIT;
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
                this.bgState = BG_STATE.DONE;

                const bg = new Background(this._coreService.storage.persistent.bgCurrent);

                this._currentBG = bg;
                this.bgMode = bg.pause ? BG_MODE.STATIC : BG_MODE.LIVE;
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
                const bg = new Background(this._coreService.storage.persistent.bgCurrent);

                this._currentBG = bg;
                this.bgMode = bg.pause ? BG_MODE.STATIC : BG_MODE.LIVE;
                this.currentBGId = this._currentBG?.id;
            },
        );
    }

    @action('get current bg')
    getCurrentBG() {
        return this._currentBG;
    }

    @action('play bg')
    play() {
        this._currentBG.pause = false;
        this.bgMode = BG_MODE.LIVE;

        this._coreService.storage.updatePersistent({ bgCurrent: { ...this._currentBG } });
        FSConnector.removeFile(this._FULL_PATH, 'temporaryVideoFrame').catch(() => {});

        return this._currentBG;
    }

    @action('pause bg')
    async pause(captureBgId, timestamp) {
        if (captureBgId !== this.currentBGId) return Promise.reject(ERRORS.ID_BG_IS_CHANGED);

        this._currentBG.pause = timestamp;
        this.bgMode = BG_MODE.STATIC;

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
    nextBG() {
        console.log('nextBG')

        if (this.settings.selectionMethod === BG_SELECT_MODE.RANDOM) {
            return this.nextBGLocal();
        } else if (this.settings.selectionMethod === BG_SELECT_MODE.RADIO) {
            return this.nextBGRadio();
        }
    }

    @action('next bg local')
    async nextBGLocal() {
        console.log('nextBGLocal')
        this.bgState = BG_STATE.SEARCH;
        const bgs = (await Promise.all(this.settings.type.map((type) => (
            DBConnector().getAllFromIndex('backgrounds', 'type', type)
        )))).flat();

        if (bgs.length === 0) {
            return await this.setCurrentBG(null);
        }

        const bgPos = Math.floor(Math.random() * bgs.length);

        let bg = bgs[bgPos];

        if (bg.id === this.currentBGId) {
            if (bgPos === 0) {
                bg = bgs[Math.min(bgPos + 1, bgs.length - 1)];
            } else {
                bg = bgs[Math.max(bgPos - 1, 0)];
            }
        }

        if (bg) await this.setCurrentBG(bg);
    }

    @action('next bg radio')
    async nextBGRadio() {
        console.log('nextBGRadio')
        this.bgState = BG_STATE.SEARCH;

        if (this._coreService.storage.persistent.bgsRadio?.length > 1) {
            this._coreService.storage.updatePersistent({
                bgsRadio: this._coreService.storage.persistent.bgsRadio.splice(1)
            });

            const bgCurr = first(this._coreService.storage.persistent.bgsRadio);

            const fileName = await this.fetchBG(bgCurr.fullSrc);

            console.log('fileName: ', fileName)

            await this.setCurrentBG(new Background({
                id: bgCurr.id,
                fileName,
                author: bgCurr.author,
                description: bgCurr.description,
                source: BG_SOURCE[bgCurr.service],
                sourceLink: bgCurr.sourceLink,
                type: BG_TYPE.IMAGE,
            }));

            return Promise.resolve();
        }

        const { response } = await fetchData(`${
            appVariables.rest.url
        }/backgrounds/get-random?type=image&query=${
            this._coreService.storage.persistent.backgroundRadioQuery || ""
        }&count=5`);

        console.log('response: ', response)

        this._coreService.storage.updatePersistent({
            bgsRadio: response.map((bg) => ({
                ...bg,
                fileName: null,
            }))
        });

        const fileName = await this.fetchBG(first(response).fullSrc);

        console.log('fileName: ', fileName)

        await this.setCurrentBG(new Background({
            id: response.id,
            fileName,
            author: response.author,
            description: response.description,
            source: BG_SOURCE[response.service],
            sourceLink: response.sourceLink,
            type: BG_TYPE.IMAGE,
        }));
    }


    @action('set current bg')
    async setCurrentBG(setBG) {
        console.log('setCurrentBG', setBG);
        if (this.currentBGId === setBG?.id) {
            this.bgState = BG_STATE.DONE;
            return Promise.resolve();
        }

        if (!setBG) {
            console.log('Error set bg')
            this._currentBG = null;
            this.currentBGId = null;

            this._coreService.storage.updatePersistent({
                bgNextSwitchTimestamp: Date.now() + BG_CHANGE_INTERVAL_MILLISECONDS[this.settings.changeInterval],
                bgCurrent: null,
            });

            this.bgState = BG_STATE.NOT_FOUND;

            return Promise.resolve();
        }

        this._currentBG = setBG;
        this.currentBGId = this._currentBG.id;

        this._coreService.storage.updatePersistent({
            bgNextSwitchTimestamp: Date.now() + BG_CHANGE_INTERVAL_MILLISECONDS[this.settings.changeInterval],
            bgCurrent: { ...setBG },
        });

        this.bgState = BG_STATE.DONE;

        return Promise.resolve();
    }

    @action('fetch BG')
    async fetchBG(src) {
        const fileName = Date.now().toString();

        console.log('Fetch BG: ', src);
        const defaultBG = await fetch(src).then((response) => response.blob());
        console.log('Create preview BG');
        const previewDefaultBG = await createPreview(defaultBG);

        console.log('Save BG');
        await FSConnector.saveFile('/backgrounds/full', defaultBG, fileName);
        await FSConnector.saveFile('/backgrounds/preview', previewDefaultBG, fileName);

        return fileName;
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
                preview: 'pending',
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
    async getAll() {
        const bgs = await DBConnector().getAll('backgrounds');

        return bgs.map((bg) => new Background(bg));
    }
}

export default BackgroundsStore;
