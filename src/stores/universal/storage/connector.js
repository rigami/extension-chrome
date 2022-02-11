import BrowserAPI from '@/utils/browserAPI';

class StorageConnector {
    static async get(keyOrKeys) {
        console.log('[StorageConnector] Get item:', keyOrKeys);

        return new Promise((resolve) => (
            BrowserAPI.localStorage.get(keyOrKeys, (data) => resolve(data || {}))
        ));
    }

    static async set(data) {
        console.log('[StorageConnector] Set item:', data);
        return new Promise((resolve) => BrowserAPI.localStorage.set(
            JSON.parse(JSON.stringify(data)),
            () => resolve(data),
        ));
    }

    static async remove(keyOrKeys) {
        console.log('[StorageConnector] Remove item:', keyOrKeys);
        return new Promise((resolve) => BrowserAPI.localStorage.remove(keyOrKeys, resolve));
    }
}

export default StorageConnector;
