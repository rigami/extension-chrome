import { observable, action } from 'mobx';
import appVariables from '@/config/appVariables';
import { BG_TYPE, BG_CHANGE_INTERVAL_MILLISECONDS } from '@/enum';
import DBConnector from '@/utils/dbConnector';
import FSConnector from '@/utils/fsConnector';
import StorageConnector from '@/utils/storageConnector';
import getPreview from '@/utils/createPreview';
import EventBus from "@/utils/eventBus";

export const ERRORS = {
    TOO_MANY_FILES: 'TOO_MANY_FILES',
    NO_FILES: 'NO_FILES',
    ID_BG_IS_CHANGED: 'ID_BG_IS_CHANGED',
};

class BackgroundsStore {
    @observable changeInterval;
    @observable selectionMethod;
    @observable bgType;
    @observable currentBGId;
    @observable uploadQueue = [];
    @observable bgState = 'pending';
    @observable count;
    @observable dimmingPower;
    _currentBG;
    _FULL_PATH = '/backgrounds/full';
    eventBus;

    // _getPreview = queuingDecorator(getPreview);

    constructor() {
        this.eventBus = new EventBus();

        StorageConnector.getItem('bg_dimming_power')
            .then((value) => { this.dimmingPower = +value; })
            .catch((e) => console.error(e));

        StorageConnector.getItem('bg_selection_method')
            .then((value) => { this.selectionMethod = value; })
            .catch((e) => console.error(e));

        StorageConnector.getItem('bg_change_interval')
            .then((value) => { this.changeInterval = value; })
            .catch((e) => console.error(e));

        StorageConnector.getJSONItem('bg_type')
            .then((value) => { this.bgType = value; })
            .catch((e) => console.error(e));

        StorageConnector.getJSONItem('bg_next_switch_timestamp')
            .then((value) => {
                if (value > Date.now()) return true;

                this.nextBG();
                return false;
            })
            .catch(() => true)
            .then((requireGetCurrentBG) => {
                if (!requireGetCurrentBG) return;

                StorageConnector.getJSONItem('bg_current')
                    .then((value) => {
                        this._currentBG = value;
                        this.bgState = value.pause ? 'pause' : 'play';
                        this.currentBGId = this._currentBG.id;
                    })
                    .catch(() => this.nextBG());
            });

        DBConnector().count('backgrounds')
            .then((value) => { this.count = value; })
            .catch((e) => console.error('Failed get store or value', e));
    }

    @action('set selection method')
    setSelectionMethod(selectionMethod) {
        this.selectionMethod = selectionMethod;

        StorageConnector.setItem('bg_selection_method', selectionMethod);
    }

    @action('set change interval')
    setChangeInterval(changeInterval) {
        this.changeInterval = changeInterval;

        StorageConnector.setItem('bg_change_interval', changeInterval);

        this.nextBG();
    }

    @action('set bg types')
    setBgType(bgTypes) {
        this.bgType = [...bgTypes];

        StorageConnector.setJSONItem('bg_type', bgTypes);

        this.nextBG();
    }

    @action('set dimming power')
    setDimmingPower(value, save = true) {
        this.dimmingPower = value;

        if (save) {
            StorageConnector.setItem('bg_dimming_power', value);
        }
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

        return StorageConnector.setJSONItem('bg_current', this._currentBG)
            .then(() => FSConnector.removeFile(this._FULL_PATH, 'temporaryVideoFrame').catch(() => {}))
            .then(() => this._currentBG);
    }

    @action('pause bg')
    pause(captureBgId, timestamp) {
        if (captureBgId !== this.currentBGId) return Promise.reject(ERRORS.ID_BG_IS_CHANGED);

        this._currentBG = {
            ...this._currentBG,
            pause: timestamp,
        };
        this.bgState = 'pause';

        return StorageConnector.setJSONItem('bg_current', this._currentBG)
            .then(() => getPreview(
                FSConnector.getBGURL(this._currentBG.fileName),
                this._currentBG.type,
                {
                    size: 'full',
                    timeStamp: timestamp,
                },
            ))
            .then((frame) => {
                if (captureBgId !== this.currentBGId) throw ERRORS.ID_BG_IS_CHANGED;

                return FSConnector.saveFile(this._FULL_PATH, frame, 'temporaryVideoFrame');
            })
            .then(() => this._currentBG);
    }

    @action('next bg')
    nextBG() {
        console.log(this.bgType, this.selectionMethod);

        return DBConnector().count('backgrounds')
            .then((count) => (count > 1 ? Math.max(Math.floor(Math.random() * (count - 1)), 0) + 1 : -1))
            .then(async (pos) => {
                let index = 0;
                let cursor = await DBConnector().transaction('backgrounds').store.openCursor();

                while (cursor) {
                    if (cursor.key !== this.currentBGId) index++;
                    if (pos === index) return cursor.value;
                    cursor = await cursor.continue();
                }
            })
            .then((bg) => bg && this.setCurrentBG(bg.id));
    }

    @action('set current bg')
    setCurrentBG(currentBGId) {
        if (this.currentBGId === currentBGId) return Promise.resolve();

        StorageConnector.setJSONItem(
            'bg_next_switch_timestamp',
            Date.now() + BG_CHANGE_INTERVAL_MILLISECONDS[this.changeInterval],
        );

        if (!currentBGId) {
            this._currentBG = null;
            this.currentBGId = null;

            return StorageConnector.setJSONItem('bg_current', null);
        }

        return DBConnector().get('backgrounds', currentBGId)
            .then((bg) => {
                this._currentBG = bg;
                this.currentBGId = this._currentBG.id;

                return bg;
            })
            .then((bg) => StorageConnector.setJSONItem('bg_current', bg))
            .catch((e) => {
                console.error(e);
            });
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
