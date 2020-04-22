import {observable, action} from 'mobx';
import default_settings from "config/settings";
import appVariables from "config/appVariables";
import {BG_TYPE} from "dict";
import DBConnector, {DBQuery} from "utils/dbConnector";
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
    @observable bgState;
    @observable count;
    @observable dimmingPower;
    _currentBG;

    // _getPreview = queuingDecorator(getPreview);

    constructor() {
        StorageConnector.getJSONItem("bg_current")
            .then((value) => {
                this._currentBG = value;
                this.currentBGId = this._currentBG.id;
                this.bgState = value.pause ? "pause" : "play";
            })
            .catch((e) => console.error(e));

        StorageConnector.getItem("bg_dimming_power")
            .then((value) => this.dimmingPower = +value)
            .catch((e) => console.error(e));

        StorageConnector.getItem("bg_selection_method")
            .then((value) => this.selectionMethod = value)
            .catch((e) => console.error(e));

        StorageConnector.getItem("bg_change_interval")
            .then((value) => this.changeInterval = value)
            .catch((e) => console.error(e));

        StorageConnector.getJSONItem("bg_type")
            .then((value) => this.bgType = value)
            .catch((e) => console.error(e));

        DBConnector.getStore("backgrounds")
            .then((store) => store.getSize())
            .then((value) => this.count = value)
            .catch((e) => console.error("Failed get store or value", e));
    }

    @action('set selection method')
    setSelectionMethod(selectionMethod) {
        this.selectionMethod = selectionMethod;

        StorageConnector.setItem("bg_selection_method", selectionMethod);
    }

    @action('set change interval')
    setChangeInterval(changeInterval) {
        this.changeInterval = changeInterval;

        StorageConnector.setItem("bg_change_interval", changeInterval);
    }

    @action('set bg types')
    setBgType(bgTypes) {
        this.bgType = [...bgTypes];

        StorageConnector.setJSONItem("bg_type", bgTypes);

        this.nextBG();
    }

    @action('set dimming power')
    setDimmingPower(value, save = true) {
        this.dimmingPower = value;

        if (save) {
            StorageConnector.setItem("bg_dimming_power", value);
        }
    }

    @action('get current bg')
    getCurrentBG() {
        return this._currentBG;
    }

    @action('play bg')
    play() {
        this.bgState = "play";

        this._currentBG = {
            ...this._currentBG,
            pause: false,
        };

        return StorageConnector.setJSONItem("bg_current", this._currentBG)
            .then(() => FSConnector.removeFile("/backgrounds/full", "temporaryVideoFrame"));
    }

    @action('pause bg')
    pause() {
        this.bgState = "pause";

        return StorageConnector.setJSONItem("bg_current", {
            ...this._currentBG,
            pause: true,
        });
    }

    @action('pause bg')
    saveTemporaryVideoFrame(captureBgId, timestamp) {
        console.log("Transform video to frame")
        console.log(captureBgId, this.currentBGId, this.bgState)

        if (captureBgId !== this.currentBGId || this.bgState !== "pause") return Promise.reject("Change bg id");

        return getPreview(
            FSConnector.getURL(this._currentBG.fileName),
            this._currentBG.type,
            {size: "full", timeStamp: timestamp}
        )
            .then((frame) => {
                if (captureBgId !== this.currentBGId || this.bgState !== "pause") throw "Change bg id";

                return FSConnector.saveFile("/backgrounds/full", frame, "temporaryVideoFrame");
            })
            .then(() => {
                if (captureBgId !== this.currentBGId || this.bgState !== "pause") throw "Change bg id";

                this._currentBG = {
                    ...this._currentBG,
                    pause: timestamp,
                };

                return StorageConnector.setJSONItem("bg_current", this._currentBG);
            })
            .then(() => this._currentBG);
    }

    @action('next bg')
    nextBG() {
        return DBConnector.getStore("backgrounds")
            .then((store) => store.getAllKeys(DBQuery.create((value) => {
                return ~this.bgType.indexOf(value.type) && value.id !== this.currentBGId;
            }, "type")))
            .then((keys) => {
                return keys[Math.round(Math.random() * (keys.length - 1))];
            })
            .then((bgId) => this.setCurrentBG(bgId));
    }

    @action('set current bg')
    setCurrentBG(currentBGId) {
        if (this.currentBGId === currentBGId) return Promise.resolve();

        if (!currentBGId) {
            this._currentBG = null;
            this.currentBGId = null;
            this.bgState = "play";

            return StorageConnector.setJSONItem("bg_current", null);
        }

        return DBConnector.getStore("backgrounds")
            .then((store) => store.getItem(currentBGId))
            .then((bg) => {
                console.log("Set current bg:", bg);
                this._currentBG = bg;
                this.currentBGId = this._currentBG.id;
                this.bgState = "play";

                return bg;
            })
            .then((bg) => StorageConnector.setJSONItem("bg_current", bg))
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
                        if (!value) throw "Not find in db";

                        fileName = value.fileName;
                    })
                    .then(() => store);
            })
            .then((store) => store.removeItem(removeBGId))
            .then(() => {
                this.count = this.count - 1;
                console.log("remove from db")
            })
            .catch((e) => console.error(e))
            .then(() => FSConnector.removeFile("/backgrounds/full/" + fileName))
            .then(() => FSConnector.removeFile("/backgrounds/preview/" + fileName))
            .catch((e) => console.error(e))
    }
}

export default BackgroundsStore;