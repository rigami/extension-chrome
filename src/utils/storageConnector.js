import { eventToBackground } from '@/stores/server/bus';

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

        eventToBackground('system/syncSettings/set', {
            key,
            value,
        });
    }

    static removeItem(key) {
        localStorage.removeItem(key);

        eventToBackground('system/syncSettings/remove', { key });
    }
}

export default StorageConnector;
