class StorageConnector {
    static getItem(key) {
        return new Promise((resolve, reject) => {
            try {
                if (localStorage.getItem(key) === null) throw "Not set value";
                resolve(localStorage.getItem(key));
            } catch (e) {
                reject(e);
            }
        });
    }

    static getJSONItem(key) {
        return StorageConnector.getItem(key)
            .then((value) => typeof value === "string" ? JSON.parse(value) : value);
    }

    static setJSONItem(key, value) {
        return StorageConnector.setItem(key, JSON.stringify(value));
    }

    static setItem(key, value) {
        return new Promise((resolve, reject) => {
            localStorage.setItem(key, value);
            resolve(value);
        });
    }

    static removeItem(key) {
        return new Promise((resolve, reject) => {
            localStorage.removeItem(key);
            resolve(value);
        });
    }
}

export default StorageConnector;