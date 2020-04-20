import appVariables from "../config/appVariables";

class FSConnector {
    static getFS(path) {
        return new Promise((resolve, reject) => {
            webkitRequestFileSystem(PERSISTENT, null, (fs) => {
                if (path === "/") {
                    resolve(fs.root);
                } else {
                    fs.root.getDirectory(path.substring(1), {create: false}, (dirEntry) => {
                        resolve(dirEntry);
                    }, reject);
                }
            }, reject)
        });
    }

    static createFS(fs, path) {
        return new Promise((resolve, reject) => {
            fs.getDirectory(path, {create: true}, resolve, reject);
        });
    }

    static saveFile(path, file, name, fs) {
        if (!fs) {
            return this.getFS(path).then((fs) => this.saveFile(path, file, name, fs));
        }

        return new Promise((resolve, reject) => {
            fs.getFile(name, {create: true}, (fileEntry) => {
                fileEntry.createWriter((fileWriter) => {
                    fileWriter.onwriteend = () => resolve(fileEntry.fullPath);
                    fileWriter.onerror = reject;

                    fileWriter.write(file);
                }, reject);
            }, reject);
        });
    }

    static getFile(path) {
        return new Promise((resolve, reject) => {
            if (!path) {
                reject("Path is require");
                return;
            }

            this.getFS(path.substring(0, path.lastIndexOf("/")), (fs) => {
                fs.getFile(path.substring(path.lastIndexOf("/") + 1), {}, (fileEntry) => {
                    resolve(fileEntry);
                }, reject);
            }, reject)
        });
    }

    static removeFile(path) {
        return new Promise((resolve, reject) => {
            if (!path) {
                reject("Path is require");
                return;
            }

            this.getFS(path.substring(0, path.lastIndexOf("/")), (fs) => {
                fs.getFile(path.substring(path.lastIndexOf("/") + 1), {}, (fileEntry) => {
                    fileEntry.remove(resolve, reject);
                }, reject);
            }, reject);
        });
    }

    static getURL(path, type = "full") {
        return `${appVariables.fs.root}backgrounds/${type}/${path}`;
    }
}

export default FSConnector;