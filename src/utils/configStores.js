import DBConnector from "./dbConnector";
import FSConnector from "./fsConnector";
import StorageConnector from "./storageConnector";
import createPreview from "utils/createPreview";
import appVariables from "config/appVariables";
import default_settings from "config/settings";
import {THEME} from "../dict";

class ConfigStores {
    static setup(progressCallBack) {
        return ConfigStores.configDB()
            .then(() => progressCallBack(5))
            .then(() => ConfigStores.configFS())
            .then(() => progressCallBack(10))
            .then(() => ConfigStores.configUserData((progressValue) => progressCallBack(10 + progressValue * 0.8)))
            .then(() => progressCallBack(100))
            .then(() => StorageConnector.setItem("bg_selection_method", default_settings.backgrounds.selection_method))
            .then(() => StorageConnector.setJSONItem("bg_type", default_settings.backgrounds.bg_type))
            .then(() => StorageConnector.setItem("bg_change_interval", default_settings.backgrounds.change_interval))
            .then(() => StorageConnector.setItem("bg_dimming_power", default_settings.backgrounds.dimming_power))
            .then(() => StorageConnector.setItem("app_theme", default_settings.app.theme))
            .then(() => StorageConnector.setItem("app_backdrop_theme", default_settings.app.backdropTheme))
            .then(() => StorageConnector.setItem("last_setup_timestamp", Date.now().toString()))
    }

    static config() {
        return StorageConnector.getItem("last_setup_timestamp")
            .then(() => ConfigStores.configDB(true))
    }

    static configUserData(progressCallBack) {
        return DBConnector.getStore("backgrounds")
            .then((store) => store.getAllItems())
            .then((values) => {
                if (values.length === 0) {
                    let fullFile;
                    let previewFile;
                    const fileName = Date.now().toString();

                    return fetch(appVariables.defaultBG.src)
                        .then((response) => response.blob())
                        .then((file) => {
                            fullFile = file;
                            return createPreview(file);
                        })
                        .then((preview) => {
                            previewFile = preview;
                            return FSConnector.saveFile("/backgrounds/full", fullFile, fileName)
                        })
                        .then(() => FSConnector.saveFile("/backgrounds/preview", previewFile, fileName))
                        .then(() => DBConnector.getStore("backgrounds"))
                        .then((store) => store.addItem({
                            ...appVariables.defaultBG,
                            fileName,
                        }))
                        .then((bgId) => StorageConnector.setJSONItem("bg_current", {
                            ...appVariables.defaultBG,
                            fileName,
                            id: bgId,
                        }));
                }
            });
    }

    static configDB(onlyOpen) {
        return DBConnector.config((db) => {
            if (onlyOpen) throw "Dont permission for upgrade db";

            console.log("Upgrade db version", db);

            const backgroundsStore = db.createObjectStore("backgrounds", {keyPath: "id", autoIncrement: true});
            backgroundsStore.createIndex("type", "type", {unique: false});
            backgroundsStore.createIndex("author", "author", {unique: false});
            backgroundsStore.createIndex("source_link", "sourceLink", {unique: false});
            backgroundsStore.createIndex("file_name", "fileName", {unique: false});
        }).then((r) => console.log("Success connect to db", r));
    }

    static configFS() {
        return FSConnector.getPath("/")
            .then((rootFS) => {
                return rootFS.createPath("bookmarksIcons")
                    .then(() => rootFS);
            })
            .then((rootFS) => rootFS.createPath("backgrounds"))
            .then((backgroundsFS) => {
                return backgroundsFS.createPath("full")
                    .then(() => backgroundsFS.createPath("preview"))
            })
            .then(() => console.log("Success create fs"));
    }
}

export default ConfigStores;