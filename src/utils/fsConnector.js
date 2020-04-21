import appVariables from "../config/appVariables";

class FSConnector {
    _fs;

    constructor(fs) {
        this._fs = fs;
    }

    getPath(path) {
        return new Promise((resolve, reject) => {
            this._fs.root.getDirectory(
                path.substring(1),
                {create: false},
                (dirEntry) => resolve(new FSConnector(dirEntry)),
                reject,
            );
        });
    }

    static getPath(path) {
        return new Promise((resolve, reject) => {
            webkitRequestFileSystem(PERSISTENT, null, (fs) => {
                if (path === "/") {
                    resolve(new FSConnector(fs.root));
                } else {
                    fs.root.getDirectory(
                        path.substring(1),
                        {create: false},
                        (dirEntry) => resolve(new FSConnector(dirEntry)),
                        reject,
                    );
                }
            }, reject)
        });
    }

    createPath(path) {
        return FSConnector.createPath(this, path);
    }

    static createPath(pathOrFSConnector, dirName) {
        if (typeof pathOrFSConnector === "string") {
            const path = dirName ? pathOrFSConnector : pathOrFSConnector.substring(0, pathOrFSConnector.lastIndexOf("/"));
            const name = dirName || pathOrFSConnector.substring(pathOrFSConnector.lastIndexOf("/") + 1);

            return FSConnector.getPath(path)
                .then((fsConnector) => FSConnector.createPath(fsConnector, name));
        }

        if (!dirName) return Promise.reject("dirName is require");

        return new Promise((resolve, reject) => {
            pathOrFSConnector._fs.getDirectory(
                dirName,
                {create: true},
                (dirEntry) => resolve(new FSConnector(dirEntry)),
                reject,
            )
        });
    }

    saveFile(file, name) {
        return FSConnector.saveFile(this, file, name);
    }

    static saveFile(pathOrFSConnector, file, name) {
        if (typeof pathOrFSConnector === "string") {
            const path = name ? pathOrFSConnector : pathOrFSConnector.substring(0, pathOrFSConnector.lastIndexOf("/"));
            const fileName = name || pathOrFSConnector.substring(pathOrFSConnector.lastIndexOf("/") + 1);

            return FSConnector.getPath(path)
                .then((fsConnector) => FSConnector.saveFile(fsConnector, file, fileName));
        }

        if (!file) return Promise.reject("File is require");
        if (!name) return Promise.reject("File name is require");

        return pathOrFSConnector.getFile(name, {create: true})
            .then((fileEntry) => {
                return new Promise((resolve, reject) => {
                    fileEntry.createWriter((fileWriter) => {
                        fileWriter.onwriteend = () => resolve(fileEntry.fullPath);
                        fileWriter.onerror = reject;

                        fileWriter.write(file);
                    }, reject);
                });
            });
    }

    getFile(name, options) {
        return FSConnector.getFile(this, name, options);
    }

    static getFile(pathOrFSConnector, name, options) {
        if (typeof pathOrFSConnector === "string") {
            const path = name ? pathOrFSConnector : pathOrFSConnector.substring(0, pathOrFSConnector.lastIndexOf("/"));
            const fileName = name || pathOrFSConnector.substring(pathOrFSConnector.lastIndexOf("/") + 1);

            return FSConnector.getPath(path)
                .then((fsConnector) => FSConnector.getFile(fsConnector, fileName, options));
        }

        if (!name) return Promise.reject("File name is require");

        return new Promise((resolve, reject) => {
            pathOrFSConnector._fs.getFile(name, {...options}, resolve, reject);
        });
    }

    removeFile(name) {
        return FSConnector.removeFile(this, name);
    }

    static removeFile(pathOrFSConnector, name) {
        if (typeof pathOrFSConnector === "string") {
            const path = name ? pathOrFSConnector : pathOrFSConnector.substring(0, pathOrFSConnector.lastIndexOf("/"));
            const fileName = name || pathOrFSConnector.substring(pathOrFSConnector.lastIndexOf("/") + 1);

            return FSConnector.getPath(path)
                .then((fsConnector) => FSConnector.removeFile(fsConnector, fileName));
        }

        if (!name) return Promise.reject("File name is require");

        return pathOrFSConnector.getFile(name, {create: false})
            .then((fileEntry) => {
                return new Promise((resolve, reject) => {
                    fileEntry.remove(resolve, (e) => {
                        console.error(e);
                        reject(e);
                    });
                });
            });
    }

    static getURL(path, type = "full") {
        return `${appVariables.fs.root}backgrounds/${type}/${path}`;
    }
}

export default FSConnector;