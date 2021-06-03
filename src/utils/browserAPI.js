export default class BrowserAPI {
    static browser = 'chrome';
    static platform = 'web';
    static localStorage = chrome.storage.local;
    static systemLanguage = (chrome?.i18n?.getUILanguage?.() || 'en').substring(0, 2);

    static extensionId() {
        return 'hgniijhnpodegoppkmcgdmkdgiifjhnm'; // 'stub-extension-id';

        // return chrome.runtime.id;
    }

    static onMessageIsSupport = true; // chrome?.runtime?.onMessage

    static onMessageListener(...props) {
        if (BrowserAPI.platform === 'web') {
            console.log('onMessageListener stub', BrowserAPI.platform, props);

            return null;
        } else {
            return chrome.runtime.onMessage.addListener;
        }
    }

    static sendMessage(...props) {
        if (BrowserAPI.platform === 'web') {
            console.log('sendMessage stub', props);

            return null;
        } else {
            return chrome.runtime.sendMessage;
        }
    }

    static onChangeStorage(callback) {
        chrome.storage.onChanged.addListener(callback);
    }
}
