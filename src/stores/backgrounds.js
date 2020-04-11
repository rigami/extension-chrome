import { observable, action } from 'mobx';
import app_variables from "config/appVariables";
import default_settings from "config/settings";
import { BG_TYPE } from "dict";
import DBConnector from "../utils/dbConnector";

class BackgroundsStore {
    @observable changeInterval;
    @observable selectionMethod;
    @observable bgType;
    @observable currentBGId;
    _currentBG;
    _store;

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
}

export default new BackgroundsStore();