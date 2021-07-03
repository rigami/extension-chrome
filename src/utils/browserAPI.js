import { pick } from 'lodash';

const localStorageStub = {
    set(value, callback) {
        localStorage.setItem('storage', value);

        callback(value);
    },
    get(keyOrKeys, callback) {
        callback(pick(
            localStorage.getItem('storage') || {},
            Array.isArray(keyOrKeys) ? keyOrKeys : [keyOrKeys],
        ));
    },
};

export default class BrowserAPI {
    static browser = 'chrome';
    static platform = chrome?.runtime ? 'extension' : 'web';
    static localStorage = this.platform === 'extension' ? chrome.storage.local : localStorageStub;
    static systemLanguage = (navigator.language || 'en').substring(0, 2);

    static extensionId() {
        return this.platform === 'extension' ? chrome?.runtime?.id : 'rigami';
    }

    static onChangeStorage(callback) {
        if (this.platform === 'extension') {
            chrome.storage.onChanged.addListener(callback);
        } else {
            window.addEventListener('storage', (e) => {
                callback({
                    [e.key]: {
                        oldValue: e.oldValue,
                        newValue: e.newValue,
                    },
                }, 'local');
            });
        }
    }
}
