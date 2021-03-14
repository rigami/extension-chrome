class StorageConnector {
    static get(key, defaultValue) {
        return localStorage.getItem(key) || defaultValue;
    }

    static getJSON(key, defaultValue) {
        try {
            return JSON.parse(StorageConnector.get(key)) || defaultValue;
        } catch (e) {
            console.warn(`Failed get json from '${key}' apply default value:`, defaultValue);
            return defaultValue;
        }
    }

    static setJSON(key, value) {
        return StorageConnector.set(key, JSON.stringify(value));
    }

    static set(key, value) {
        localStorage.setItem(key, value);
    }

    static remove(key) {
        localStorage.removeItem(key);
    }
}

export default StorageConnector;
