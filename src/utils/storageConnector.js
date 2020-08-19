class StorageConnector {
    static getItem(key) {
        return new Promise((resolve, reject) => {
            try {
                if (localStorage.getItem(key) === null) {
                    reject(new Error('Not set value'));
                } else {
                    resolve(localStorage.getItem(key));
                }
            } catch (e) {
                reject(e);
            }
        });
    }

    static getJSONItem(key) {
        return StorageConnector.getItem(key)
            .then((value) => (typeof value === 'string' ? JSON.parse(value) : value));
    }

    static setJSONItem(key, value) {
        return StorageConnector.setItem(key, JSON.stringify(value));
    }

    static setItem(key, value) {
        localStorage.setItem(key, value);
    }

    static removeItem(key) {
        return new Promise((resolve) => {
            localStorage.removeItem(key);
            resolve();
        });
    }
}

export default StorageConnector;
