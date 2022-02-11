import {
    makeAutoObservable,
    runInAction,
    toJS,
} from 'mobx';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import { captureException } from '@sentry/react';
import { DESTINATION } from '@/enum';
import BusService, { initBus } from '@/stores/universal/serviceBus';
import BrowserAPI from '@/utils/browserAPI';
import awaitInstallStorage from '@/utils/helpers/awaitInstallStorage';
import forceCrash from '@/utils/helpers/forceCrash';
import packageJson from '../../../../package.json';
import localEventBus from '@/utils/localEventBus';
import PersistentStorage from '@/stores/universal/storage/persistent';
import StorageConnector from '@/stores/universal/storage/connector';
import TempStorage from '@/stores/universal/storage/temp';

const APP_STATE = {
    WAIT: 'WAIT',
    INIT: 'INIT',
    REQUIRE_SETUP: 'REQUIRE_SETUP',
    REQUIRE_MIGRATE: 'REQUIRE_MIGRATE',
    WORK: 'WORK',
};

const PREPARE_PROGRESS = {
    WAIT: 'WAIT',
    CREATE_FS: 'CREATE_FS',
    CREATE_DEFAULT_STRUCTURE: 'CREATE_DEFAULT_STRUCTURE',
    IMPORT_BOOKMARKS: 'IMPORT_BOOKMARKS',
    FETCH_BG: 'FETCH_BG',
    SAVE_BG: 'SAVE_BG',
    REGISTRATION_IN_CLOUD: 'REGISTRATION_IN_CLOUD',
    DONE: 'DONE',
};

class CoreService {
    globalEventBus;
    localEventBus;
    storage;
    appState = APP_STATE.WAIT;
    isOffline = !window.navigator.onLine;

    constructor({ side }) {
        makeAutoObservable(this);

        this.subscribe(side);
    }

    async initI18n() {
        let overrideLng;

        if (!PRODUCTION_MODE) {
            const { devTools = {} } = await StorageConnector.get('devTools', {});

            console.log('devTools:', devTools, devTools.locale || BrowserAPI.systemLanguage || 'en');

            overrideLng = devTools.locale;
        }

        return i18n
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
                    'settingsSync',
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
            });
    }

    async subscribe(side) {
        this.appState = APP_STATE.INIT;
        initBus(side || DESTINATION.APP);
        this.globalEventBus = BusService();
        this.localEventBus = localEventBus;
        this.storage = new PersistentStorage('storage');
        this.tempStorage = new TempStorage();

        this.globalEventBus.on('system/ping', ({ data, callback }) => {
            callback({ type: data });
        });

        window.addEventListener('offline', () => { this.isOffline = true; });
        window.addEventListener('online', () => { this.isOffline = false; });

        try {
            console.time('Initialization time');
            await this.initI18n();
            console.timeEnd('Initialization time');

            console.log('this.storage:', toJS(this.storage.data));
        } catch (e) {
            console.error(e);
            captureException(e);

            forceCrash(new Error('ERR_INIT_I18N'));
            return;
        }

        console.log('Await sync storage...', this.storage);
        console.time('Await install storage service');

        try {
            await awaitInstallStorage(this.storage);
        } catch (e) {
            console.error(e);
            forceCrash(new Error('ERR_INIT_STORAGE'));
            return;
        }

        console.log('Storage is sync!');
        console.timeEnd('Await install storage service');

        runInAction(() => {
            if (
                this.storage.data.migrateToMv3Progress
                || (
                    this.storage.data.lastUsageVersion
                    && this.storage.data.lastUsageVersion !== packageJson.version
                )
            ) {
                this.appState = APP_STATE.REQUIRE_MIGRATE;
            } else if (
                this.storage.data.factoryResetProgress
                || !this.storage.data.lastUsageVersion
            ) {
                this.appState = APP_STATE.REQUIRE_SETUP;
            } else {
                this.appState = APP_STATE.WORK;
            }
        });
    }
}

export default CoreService;
export { APP_STATE, PREPARE_PROGRESS };
