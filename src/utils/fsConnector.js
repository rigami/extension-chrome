import appVariables from '../config/appVariables';

function getPathAndName(pathOrFS, name) {
    const path = name ? pathOrFS : pathOrFS.substring(0, pathOrFS.lastIndexOf('/'));

    return {
        path,
        name: name || pathOrFS.substring(pathOrFS.lastIndexOf('/') + 1),
    };
}

class FSConnector {
    _fs;

    static ERRORS = {
        FILE_IS_REQUIRE: 'FILE_IS_REQUIRE',
        FILE_NAME_IS_REQUIRE: 'FILE_NAME_IS_REQUIRE',
    };

    constructor(fs) {
        this._fs = fs;
    }

    getPath(path) {
        return new Promise((resolve, reject) => {
            this._fs.root.getDirectory(
                path.substring(1),
                { create: false },
                (dirEntry) => resolve(new FSConnector(dirEntry)),
                reject,
            );
        });
    }

    static getPath(path) {
        return new Promise((resolve, reject) => {
            function requestFS(grantedBytes) {
                window.webkitRequestFileSystem(window.PERSISTENT, grantedBytes, (fs) => {
                    if (path === '/') {
                        resolve(new FSConnector(fs.root));
                    } else {
                        fs.root.getDirectory(
                            path.substring(1),
                            { create: false },
                            (dirEntry) => resolve(new FSConnector(dirEntry)),
                            reject,
                        );
                    }
                }, reject);
            }

            navigator.webkitPersistentStorage.requestQuota(1024 * 1024 * 1024, requestFS, reject);
        });
    }

    createPath(path) {
        return FSConnector.createPath(this, path);
    }

    static createPath(pathOrFSConnector, dirName) {
        if (typeof pathOrFSConnector === 'string') {
            const { path, name } = getPathAndName(pathOrFSConnector, dirName);

            return FSConnector.getPath(path)
                .then((fsConnector) => FSConnector.createPath(fsConnector, name));
        }

        if (!dirName) return Promise.reject(new Error('dirName is require'));

        return new Promise((resolve, reject) => {
            pathOrFSConnector._fs.getDirectory(
                dirName,
                { create: true },
                (dirEntry) => resolve(new FSConnector(dirEntry)),
                reject,
            );
        });
    }

    saveFile(file, name) {
        return FSConnector.saveFile(this, file, name);
    }

    static saveFile(pathOrFSConnector, file, name) {
        if (typeof pathOrFSConnector === 'string') {
            const { path, name: fileName } = getPathAndName(pathOrFSConnector, name);

            return FSConnector.getPath(path)
                .then((fsConnector) => FSConnector.saveFile(fsConnector, file, fileName));
        }

        if (!file) return Promise.reject(FSConnector.ERRORS.FILE_IS_REQUIRE);
        if (!name) return Promise.reject(FSConnector.ERRORS.FILE_NAME_IS_REQUIRE);

        return pathOrFSConnector.getFile(name, { create: true })
            .then((fileEntry) => new Promise((resolve, reject) => {
                fileEntry.createWriter((fileWriter) => {
                    fileWriter.onwriteend = () => resolve(fileEntry.fullPath);
                    fileWriter.onerror = reject;

                    fileWriter.write(file);
                }, reject);
            }));
    }

    getFile(name, options) {
        return FSConnector.getFile(this, name, options);
    }

    static getFile(pathOrFSConnector, name, options) {
        if (typeof pathOrFSConnector === 'string') {
            const { path, name: fileName } = getPathAndName(pathOrFSConnector, name);

            return FSConnector.getPath(path)
                .then((fsConnector) => FSConnector.getFile(fsConnector, fileName, options));
        }

        if (!name) return Promise.reject(FSConnector.ERRORS.FILE_NAME_IS_REQUIRE);

        return new Promise((resolve, reject) => {
            pathOrFSConnector._fs.getFile(name, { ...options }, resolve, reject);
        });
    }

    removeFile(name) {
        return FSConnector.removeFile(this, name);
    }

    static removeFile(pathOrFSConnector, name) {
        if (typeof pathOrFSConnector === 'string') {
            const { path, name: fileName } = getPathAndName(pathOrFSConnector, name);

            return FSConnector.getPath(path)
                .then((fsConnector) => FSConnector.removeFile(fsConnector, fileName));
        }

        if (!name) return Promise.reject(FSConnector.ERRORS.FILE_NAME_IS_REQUIRE);

        return pathOrFSConnector.getFile(name, { create: false })
            .then((fileEntry) => new Promise((resolve, reject) => {
                fileEntry.remove(resolve, (e) => {
                    console.error(e);
                    reject(e);
                });
            }));
    }

    static getBGURL(path, type = 'full') {
        return FSConnector.getURL(`backgrounds/${type}/${path}`);
    }

    static getIconURL(path) {
        return FSConnector.getURL(`bookmarksIcons/${path}`);
    }

    static getURL(path) {
        return `filesystem:${appVariables.fs.root || `${location.origin}/persistent/`}${path}`;
    }
}

export default FSConnector;
