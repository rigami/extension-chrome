import BusApp, { initBus } from '@/stores/server/bus';
import { DESTINATION } from '@/enum';
import {
    makeAutoObservable,
    runInAction, toJS,
} from 'mobx';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import EventBus from '@/utils/eventBus';
import { captureException } from '@sentry/react';
import BrowserAPI from '@/utils/browserAPI';
import Storage, { StorageConnector } from '@/stores/universal/storage';
import awaitInstallStorage from '@/utils/awaitInstallStorage';

const APP_STATE = {
    WAIT_INIT: 'WAIT_INIT',
    INIT: 'INIT',
    REQUIRE_SETUP: 'REQUIRE_SETUP',
    WORK: 'WORK',
    FAILED: 'FAILED',
};

const PREPARE_PROGRESS = {
    WAIT: 'WAIT',
    CREATE_FS: 'CREATE_FS',
    CREATE_DEFAULT_STRUCTURE: 'CREATE_DEFAULT_STRUCTURE',
    IMPORT_BOOKMARKS: 'IMPORT_BOOKMARKS',
    FETCH_BG: 'FETCH_BG',
    SAVE_BG: 'SAVE_BG',
    DONE: 'DONE',
};

class Core {
    globalEventBus;
    localEventBus;
    storage;
    appState = APP_STATE.WAIT_INIT;
    appError = '';
    isOffline = !window.navigator.onLine;

    constructor({ side }) {
        makeAutoObservable(this);

        this.subscribe(side);
    }

    async initialization() {
        let overrideLng;

        if (!PRODUCTION_MODE) {
            const { devTools = {} } = await StorageConnector.get('devTools', {});

            console.log('devTools:', devTools, devTools.lng || BrowserAPI.systemLanguage || 'en');

            overrideLng = devTools.lng;
        }

        await i18n
            .use(Backend)
            .use(initReactI18next)
            .init({
                lng: overrideLng || BrowserAPI.systemLanguage || 'en',
                load: 'languageOnly',
                cleanCode: true,
                nonExplicitSupportedLngs: true,
                supportedLngs: ['en', 'ru'],
                fallbackLng: 'en',
                debug: !PRODUCTION_MODE,
                ns: [
                    'common',
                    'bookmark',
                    'background',
                    'tag',
                    'desktop',
                    'settings',
                    'settingsBackup',
                    `changelog_${BUILD}`,
                ],
                defaultNS: 'common',
                backend: { loadPath: 'resource/i18n/{{lng}}/{{ns}}.json' },
                react: {
                    useSuspense: false,
                    wait: true,
                },
                partialBundledLanguages: true,
            })
            .then(() => {
                console.log('Load i18n!');
            })
            .catch((e) => {
                console.error('Failed init i18n:', e);
                captureException(e);

                this.appError = 'ERR_INIT_I18N';
                this.appState = APP_STATE.FAILED;
            });
    }

    async subscribe(side) {
        this.appState = APP_STATE.INIT;
        initBus(side || DESTINATION.APP);
        this.globalEventBus = BusApp();
        this.localEventBus = new EventBus();
        this.storage = new Storage('storage');

        this.globalEventBus.on('system/ping', ({ data, callback }) => {
            callback({ type: data });
        });

        console.log('Await sync storage...', this.storage.persistent);
        console.time('Await install storage service');

        try {
            await awaitInstallStorage(this.storage.persistent);
        } catch (e) {
            console.error(e);
            this.appError = 'ERR_INIT_STORAGE';
            this.appState = APP_STATE.FAILED;
            return;
        }

        console.log('Storage is sync!');
        console.timeEnd('Await install storage service');

        try {
            console.time('Initialization time');
            await this.initialization();
            console.timeEnd('Initialization time');

            if (this.appState === APP_STATE.FAILED) throw new Error('Failed init app');

            console.log('this.storage.persistent:', toJS(this.storage.persistent.data));

            runInAction(() => {
                if (this.storage.persistent.data.factoryResetProgress) {
                    this.appState = APP_STATE.REQUIRE_SETUP;
                } else {
                    this.appState = APP_STATE.WORK;
                }
            });
        } catch (e) {
            console.error(e);
            captureException(e);
            runInAction(() => {
                this.appError = this.appError || 'ERR_UNKNOWN';
                this.appState = APP_STATE.FAILED;
            });
        }

        window.addEventListener('offline', () => { this.isOffline = true; });
        window.addEventListener('online', () => { this.isOffline = false; });
    }
}

export default Core;
export { APP_STATE, PREPARE_PROGRESS, Storage };
