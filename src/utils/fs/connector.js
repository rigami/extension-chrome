import { getPathAndName } from './utils';

export default class FSConnector {
    _fs;

    static ERRORS = {
        FILE_IS_REQUIRE: 'FILE_IS_REQUIRE',
        FILE_NAME_IS_REQUIRE: 'FILE_NAME_IS_REQUIRE',
    };

    constructor(unwrapFs) {
        this._fs = unwrapFs;
    }

    cd(path, options) {
        return new Promise((resolve, reject) => {
            console.log('this._fs:', this._fs);
            this._fs.getDirectory(
                path,
                options,
                (dirEntry) => resolve(new FSConnector(dirEntry)),
                reject,
            );
        });
    }

    async mkdir(path) {
        try {
            return await this.cd(path, { create: true });
        } catch (e) {
            let checkPath = '';
            let dir;
            for await (const dirName of path.split('/')) {
                if (!dirName) continue;
                checkPath = `${checkPath}/${dirName}`;
                dir = await this.cd(checkPath, { create: true });
            }

            return dir;
        }
    }

    write(savePath, file) {
        const { name: fileName } = getPathAndName(savePath);

        if (!file) return Promise.reject(FSConnector.ERRORS.FILE_IS_REQUIRE);
        if (!fileName) return Promise.reject(FSConnector.ERRORS.FILE_NAME_IS_REQUIRE);

        return this.read(savePath, {
            create: true,
            type: 'unwrap',
        })
            .then((fileEntry) => new Promise((resolve, reject) => {
                console.log(fileEntry);

                fileEntry.createWriter((fileWriter) => {
                    let truncated = false;
                    fileWriter.onwriteend = () => {
                        if (!truncated) {
                            truncated = true;
                            fileWriter.truncate(fileWriter.position);
                            return;
                        }

                        resolve(fileEntry.fullPath);
                    };

                    fileWriter.onerror = reject;

                    fileWriter.write(file);
                }, reject);
            }));
    }

    async read(path, { type, ...options } = {}) {
        const { name: fileName } = getPathAndName(path);

        if (!fileName) return Promise.reject(FSConnector.ERRORS.FILE_NAME_IS_REQUIRE);

        const file = await new Promise((resolve, reject) => {
            this._fs.getFile(path, { ...options }, resolve, reject);
        });

        if (!type) return Promise.resolve(new FSConnector(file));

        if (type === 'blob') {
            return new Promise(((resolve) => file.file(resolve)));
        }

        if (type === 'unwrap') {
            return Promise.resolve(file);
        }

        return new Promise(((resolve, reject) => {
            file.file((readFile) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;

                if (type === 'text') {
                    reader.readAsText(readFile);
                } else if (type === 'base64') {
                    reader.readAsDataURL(readFile);
                } else if (type === 'arrayBuffer') {
                    reader.readAsArrayBuffer(readFile);
                }
            });
        }));
    }

    async rmrf(removeFilePath) {
        const { path, name: fileName } = getPathAndName(removeFilePath);

        const dir = await this.cd(path);

        if (fileName === '*') {
            return new Promise((resolve, reject) => {
                dir._fs.removeRecursively(resolve, (e) => {
                    console.error(e);
                    reject(e);
                });
            });
        }

        if (!fileName) return Promise.reject(FSConnector.ERRORS.FILE_NAME_IS_REQUIRE);

        const file = await dir.read(fileName, {
            create: false,
            type: 'unwrap',
        });

        return new Promise((resolve, reject) => {
            file.remove(resolve, (e) => {
                console.error(e);
                reject(e);
            });
        });
    }
}
