import BusApp, { eventToBackground, initBus } from '@/stores/server/bus';
import {
    BG_SOURCE,
    BG_TYPE,
    DESTINATION,
    SERVICE_STATE,
} from '@/enum';
import {
    reaction,
    makeAutoObservable,
    runInAction,
} from 'mobx';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import db, { open as openDB } from '@/utils/db';
import appVariables from '@/config/appVariables';
import EventBus from '@/utils/eventBus';
import { first } from 'lodash';
import Background from '@/stores/universal/backgrounds/entities/background';
import BackgroundsUniversalService from '@/stores/universal/backgrounds/service';
import fetchData from '@/utils/fetchData';
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
        openDB().catch((e) => {
            console.error('Failed init db:', e);
            captureException(e);

            this.appError = 'ERR_INIT_DB';
            this.appState = APP_STATE.FAILED;
        });

        let overrideLng;

        if (!PRODUCTION_MODE) {
            const { devTools = {} } = await StorageConnector.get('devTools', {});

            console.log('devTools:', devTools, devTools.lng || BrowserAPI.systemLanguage || 'en');

            overrideLng = devTools.lng;
        }

        await i18n
            .use(initReactI18next)
            .use(Backend)
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

    async setDefaultState(progressCallback) {
        progressCallback(10, PREPARE_PROGRESS.CREATE_DEFAULT_STRUCTURE);

        try {
            await db().add('folders', {
                id: 1,
                name: 'Sundry',
                parentId: 0,
            });
        } catch (e) {
            console.warn(e);
        }

        if (BUILD === 'full') {
            progressCallback(15, PREPARE_PROGRESS.IMPORT_BOOKMARKS);

            console.log('Import system bookmarks');
            await new Promise((resolve) => eventToBackground('system/importSystemBookmarks', {}, () => {
                console.log('Finish import');
                resolve();
            }));
        }

        console.log('Fetch BG');
        progressCallback(35, PREPARE_PROGRESS.FETCH_BG);

        const { response } = await fetchData(
            `${appVariables.rest.url}/backgrounds/get-from-collection?count=1&type=image&collection=best`,
        ).catch(() => ({ response: [] }));

        progressCallback(70, PREPARE_PROGRESS.SAVE_BG);

        let bg;

        if (response.length !== 0) {
            bg = await BackgroundsUniversalService.addToLibrary(new Background({
                ...first(response),
                source: BG_SOURCE[first(response).service],
                downloadLink: first(response).fullSrc,
                type: BG_TYPE[first(response).type],
            }));
        } else {
            bg = await BackgroundsUniversalService.addToLibrary(new Background(appVariables.backgrounds.fallback));
        }

        this.storage.persistent.update({ bgCurrent: bg });

        this.appState = APP_STATE.WORK;

        console.log('DONE');
        progressCallback(100, PREPARE_PROGRESS.DONE);

        return Promise.resolve();
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

            runInAction(() => {
                if (!this.storage.persistent.data.lastUsageVersion) {
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
