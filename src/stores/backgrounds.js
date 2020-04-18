import {observable, action} from 'mobx';
import default_settings from "config/settings";
import appVariables from "config/appVariables";
import {BG_TYPE} from "dict";
import DBConnector from "utils/dbConnector";
import { queuingDecorator } from "utils/decorators";

const getPreview = (file) => {
    console.log("Get preview for file:", file);
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log("Result preview for file:", file);
            resolve();
        }, 3000);
    });
};

export const ERRORS = {
    TOO_MANY_FILES: 'too_many_files',
    NO_FILES: 'no_files',
};

class BackgroundsStore {
    @observable changeInterval;
    @observable selectionMethod;
    @observable bgType;
    @observable currentBGId;
    _currentBG;
    _store;
    // _getPreview = queuingDecorator(getPreview);

    constructor() {
        this.changeInterval = default_settings.backgrounds.change_interval;
        this.selectionMethod = default_settings.backgrounds.selection_method;
        this.bgType = default_settings.backgrounds.bg_type;

        DBConnector.config()
            .then((r) => {
                console.log("Success connect to db", r);

                DBConnector.getStore("backgrounds")
                    .then((store) => {
                        console.log("Success get store", store);

                        this._store = store;

                        store.getItem(1)
                            .then((value) => {
                                console.log("Success get value", value);

                                this._currentBG = value;
                                this.currentBGId = value.id;
                            })
                            .catch((e) => console.error("Failed get value", e));
                    })
                    .catch((e) => console.error("Failed get store", e));
            })
            .catch((e) => console.error("Failed connect to db", e));
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

    @action('get all bg`s')
    getAllBGs() {
        if (!DBConnector.isConfig) return Promise.reject();

        return DBConnector.getStore("backgrounds")
            .then((store) => store.getAllItems());
    }

    @action('load bg`s to local catalog from pc')
    loadBGsToLocalCatalog(fileList) {
        console.log("Upload bg`s:", fileList);

        if(!fileList || fileList.length === 0) return Promise.reject(ERRORS.NO_FILES);

        if (fileList.length > appVariables.maxUploadFiles) return Promise.reject(ERRORS.TOO_MANY_FILES);

        const uploadTimestamp = Date.now().toString();

        return Promise.all(Array.from(fileList).map((file, index) => {
            console.log(file);

            return {
                id: uploadTimestamp + "-" + index,
                getPreview: () => getPreview(file),
                type: ~file.type.indexOf("video") ? [BG_TYPE.VIDEO] : [BG_TYPE.IMAGE, BG_TYPE.ANIMATION],
                size: file.size / 1024,
                format: file.type.substring(file.type.indexOf("/") + 1),
                name: file.name,
                file,
            };
        }));
    }
}

export default new BackgroundsStore();