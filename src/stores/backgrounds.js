import {observable, action} from 'mobx';
import default_settings from "config/settings";
import appVariables from "config/appVariables";
import {BG_TYPE} from "dict";
import DBConnector from "utils/dbConnector";
import FSConnector from "utils/fsConnector";
import StorageConnector from "utils/storageConnector";
import getPreview from "utils/createPreview";

export const ERRORS = {
    TOO_MANY_FILES: 'too_many_files',
    NO_FILES: 'no_files',
};

class BackgroundsStore {
    @observable changeInterval;
    @observable selectionMethod;
    @observable bgType;
    @observable currentBGId;
    @observable uploadQueue = [];
    @observable count;
    _currentBG;

    // _getPreview = queuingDecorator(getPreview);

    constructor() {
        this.changeInterval = default_settings.backgrounds.change_interval;
        this.selectionMethod = default_settings.backgrounds.selection_method;
        this.bgType = default_settings.backgrounds.bg_type;

        StorageConnector.getJSONItem("currentBG")
            .then((value) => {
                this._currentBG = value;
                this.currentBGId = this._currentBG.id;
            })
            .catch((e) => {
                console.error(e)
            });

        DBConnector.getStore("backgrounds")
            .then((store) => store.getSize())
            .then((value) => {
                this.count = value;
            })
            .catch((e) => console.error("Failed get store or value", e));
    }

    @action('set selection method')
    setSelectionMethod(selectionMethod) {
        this.selectionMethod = selectionMethod;
    }

    @action('set change interval')
    setChangeInterval(changeInterval) {
        this.changeInterval = changeInterval;
    }

    @action('set bg types')
    setBgType(bgTypes) {
        this.bgType = [...bgTypes];
    }

    @action('toggle bg type')
    toggleBgType(bgType) {
        if (this.bgType.find(type => type === bgType)) {
            this.bgType.filter(type => type !== bgType)
        } else {
            this.bgType.push(bgType);
        }
    }

    @action('get current bg')
    getCurrentBG() {
        return this._currentBG;
    }

    @action('next bg')
    nextBG() {
        return DBConnector.getStore("backgrounds")
            .then((store) => store.getAllKeys())
            .then((keys) => {
                return keys[Math.round(Math.random() * (keys.length - 1))];
            })
            .then((bgId) => {
                return DBConnector.getStore("backgrounds")
                    .then((store) => store.getItem(bgId));
            })
            .then((bg) => {
                console.log("Next bg:", bg);
                this._currentBG = bg;
                this.currentBGId = this._currentBG.id;

                return bg;
            })
            .then((bg) => StorageConnector.setJSONItem("currentBG", bg))
            .catch((e) => {
                console.error(e)
            });
    }

    @action('get bg`s store')
    getStore() {
        if (!DBConnector.isConfig) return Promise.reject();

        return DBConnector.getStore("backgrounds");
    }

    @action('add bg`s to queue')
    addToUploadQueue(fileList) {
        if (!fileList || fileList.length === 0) return Promise.reject(ERRORS.NO_FILES);

        if (fileList.length > appVariables.maxUploadFiles) return Promise.reject(ERRORS.TOO_MANY_FILES);

        const uploadTimestamp = Date.now().toString();

        const getNextPreview = () => {
            let bg = this.uploadQueue.find(({preview}) => preview === "pending");
            console.log("Next bg", bg);

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
            console.log(file);

            return {
                id: uploadTimestamp + "-" + index,
                preview: "pending",
                previewUrl: null,
                type: ~file.type.indexOf("video") ? [BG_TYPE.VIDEO] : [BG_TYPE.IMAGE, BG_TYPE.ANIMATION],
                size: file.size / 1024 / 1024,
                format: file.type.substring(file.type.indexOf("/") + 1),
                name: file.name,
                file,
            };
        })).then((bgs) => {
            this.uploadQueue = [...this.uploadQueue, ...bgs];

            getNextPreview();

            return bgs;
        });
    }

    @action('remove bg from queue')
    removeFromUploadQueue(removeBGId) {
        this.uploadQueue = this.uploadQueue.filter(({id}) => removeBGId !== id);
    }

    @action('save bg`s in store')
    saveFromUploadQueue(saveBGId, options) {
        const saveBG = {
            ...this.uploadQueue.find(({id}) => saveBGId === id),
            ...{
                antiAliasing: true,
                ...options,
            },
        };
        console.log(saveBG);

        return FSConnector.saveFile("/backgrounds/full", saveBG.file, saveBGId)
            .then(() => FSConnector.saveFile("/backgrounds/preview", saveBG.preview, saveBGId))
            .then(() => DBConnector.getStore("backgrounds"))
            .then((store) => store.addItem({
                author: "unknown",
                type: saveBG.type[0],
                fileName: saveBGId,
                description: "user_background",
                sourceLink: saveBG.name,
                antiAliasing: saveBG.antiAliasing,
            }))
            .then(() => {
                this.uploadQueue = this.uploadQueue.filter(({id}) => saveBGId !== id);
                this.count = this.count + 1;
            })
    }

    @action('remove bg from store')
    removeFromStore(removeBGId) {
        let fileName;

        return DBConnector.getStore("backgrounds")
            .then((store) => {
                return store.getItem(removeBGId)
                    .then((value) => {
                        fileName = value.fileName;
                    })
                    .then(() => store);
            })
            .then((store) => store.removeItem(removeBGId))
            .then(() => {
                this.count = this.count - 1;
            })
            .then(() => FSConnector.removeFile("/backgrounds/full/"+fileName))
            .then(() => FSConnector.removeFile("/backgrounds/preview/"+fileName))

    }
}

export default BackgroundsStore;