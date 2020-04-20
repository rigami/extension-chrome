import DBConnector from "./dbConnector";
import FSConnector from "./fsConnector";
import StorageConnector from "./storageConnector";
import createPreview from "utils/createPreview";
import appVariables from "../config/appVariables";

class ConfigStores {
    static config() {
        return ConfigStores.configDB()
            .then(() => ConfigStores.configFS())
            .then(() => ConfigStores.configUserData())
    }

    static configUserData() {
        return StorageConnector.getItem("firstContactTimestamp")
            .catch(() => {
                console.log("Not find user data. First contact...")
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
                                    console.log(file)
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
                        }
                    })
                    .then(() => StorageConnector.setItem("firstContactTimestamp", Date.now().toString()))
            })
            .then(() => console.log("User data is configured"));
    }

    static configDB() {
        return DBConnector.config((db) => {
            console.log("Upgrade db version", db);

            const backgroundsStore = db.createObjectStore("backgrounds", {keyPath: "id", autoIncrement: true});
            backgroundsStore.createIndex("type", "type", {unique: false});
            backgroundsStore.createIndex("author", "author", {unique: false});
            backgroundsStore.createIndex("source_link", "sourceLink", {unique: false});
            backgroundsStore.createIndex("file_name", "fileName", {unique: false});
        }).then((r) => console.log("Success connect to db", r));
    }

    static configFS() {
        return FSConnector.getFS("/")
            .then((rootFS) => {
                console.log(rootFS);

                return FSConnector.createFS(rootFS, "bookmarksIcons")
                    .then(() => rootFS);
            })
            .then((rootFS) => FSConnector.createFS(rootFS, "backgrounds"))
            .then((backgroundsFS) => {
                return FSConnector.createFS(backgroundsFS, "full")
                    .then(() => FSConnector.createFS(backgroundsFS, "preview"))
            })
            .then(() => console.log("Success create fs"));
    }
}

export default ConfigStores;