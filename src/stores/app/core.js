import BusApp, { eventToBackground, initBus, instanceId } from '@/stores/server/bus';
import { BG_SOURCE, BG_TYPE, DESTINATION } from '@/enum';
import {
    reaction,
    action,
    makeAutoObservable,
    runInAction,
} from 'mobx';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import { open as openDB } from '@/utils/db';
import appVariables from '@/config/appVariables';
import fs, { open as openFS } from '@/utils/fs';
import EventBus from '@/utils/eventBus';
import { assign, first } from 'lodash';
import Background from '@/stores/universal/backgrounds/entities/background';
import BackgroundsUniversalService from '@/stores/universal/backgrounds/service';
import fetchData from '@/utils/xhrPromise';
import StorageConnector from '@/utils/storageConnector';
import { captureException } from '@sentry/react';

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
    FETCH_BG: 'FETCH_BG',
    SAVE_BG: 'SAVE_BG',
    DONE: 'DONE',
};

class Storage {
    temp;
    persistent;
    isSync = false;

    constructor() {
        makeAutoObservable(this);
        this.temp = {};
        this.persistent = {};
        try {
            if (!localStorage.getItem('storage')) throw new Error('Storage not exist');
            this.updatePersistent(JSON.parse(localStorage.getItem('storage')), false);
            this.isSync = true;
        } catch (e) {
            console.warn('Failed get app settings from cache. Request form background...');
            captureException(e);
            eventToBackground('system/getStorage', null, (persistent) => {
                this.updatePersistent(persistent, false);
                this.isSync = true;
            });
        }

        BusApp().on('system/syncStorage', ({ storage, changeInitiatorId }) => {
            if (changeInitiatorId !== instanceId) this.updatePersistent(storage, false);
        });
    }

    @action
    updateTemp(props = {}) {
        assign(this.temp, props);
    }

    @action
    updatePersistent(props = {}, sync = true) {
        assign(this.persistent, props);

        if (sync) eventToBackground('system/syncStorage', props);
    }
}

class Core {
    globalEventBus;
    localEventBus;
    storage;
    appState = APP_STATE.WAIT_INIT;
    appError = '';
    isOffline = !window.navigator.onLine;

    constructor({ side }) {
        makeAutoObservable(this);
        this.appState = APP_STATE.INIT;
        initBus(side || DESTINATION.APP);
        this.globalEventBus = BusApp();
        this.localEventBus = new EventBus();
        this.storage = new Storage();

        const init = async () => {
            try {
                await this.initialization();

                if (this.appState === APP_STATE.FAILED) throw new Error('Failed init app');

                runInAction(() => {
                    if (!this.storage.persistent.lastUsageVersion) {
                        this.appState = APP_STATE.REQUIRE_SETUP;
                    } else {
                        this.appState = APP_STATE.WORK;
                    }
                });
            } catch (e) {
                captureException(e);
                runInAction(() => {
                    this.appError = this.appError || 'ERR_UNKNOWN';
                    this.appState = APP_STATE.FAILED;
                });
            }
        };

        this.globalEventBus.on('system/ping', (data, options, callback) => {
            callback({ type: data });
        });

        reaction(() => this.storage.isSync, () => { init(); });

        if (this.storage.isSync) init();

        window.addEventListener('offline', () => { this.isOffline = true; });
        window.addEventListener('online', () => { this.isOffline = false; });
    }

    async initialization() {
        openFS().catch((e) => {
            console.error('Failed init fs:', e);
            captureException(e);

            this.appError = 'ERR_INIT_FS';
            this.appState = APP_STATE.FAILED;
        });

        openDB().catch((e) => {
            console.error('Failed init db:', e);
            captureException(e);

            this.appError = 'ERR_INIT_DB';
            this.appState = APP_STATE.FAILED;
        });

        await i18n
            .use(initReactI18next)
            .use(Backend)
            .init({
                lng: StorageConnector.getJSON('devTools', {}).locale
                    || (chrome?.i18n?.getUILanguage?.() || 'en').substring(0, 2),
                load: 'languageOnly',
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
                    'newVersion',
                ],
                defaultNS: 'common',
                backend: { loadPath: 'resource/i18n/{{lng}}/{{ns}}.json' },
                react: { useSuspense: false },
            })
            .catch((e) => {
                console.error('Failed init i18n:', e);
                captureException(e);

                this.appError = 'ERR_INIT_I18N';
                this.appState = APP_STATE.FAILED;
            });
    }

    async setDefaultState(progressCallback) {
        console.log('Create FS');
        progressCallback(5, PREPARE_PROGRESS.CREATE_FS);
        await fs().mkdir('/temp');
        await fs().mkdir('/bookmarksIcons');
        await fs().mkdir('/backgrounds/full');
        await fs().mkdir('/backgrounds/preview');

        console.log('Fetch BG');
        progressCallback(10, PREPARE_PROGRESS.FETCH_BG);

        const { response } = await fetchData(
            `${appVariables.rest.url}/backgrounds/get-from-collection?count=1&type=image&collection=best`,
        ).catch(() => ({ response: [] }));

        progressCallback(30, PREPARE_PROGRESS.FETCH_BG);

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

        this.storage.updatePersistent({ bgCurrent: bg });

        this.appState = APP_STATE.WORK;

        console.log('DONE');
        progressCallback(100, PREPARE_PROGRESS.DONE);

        return Promise.resolve();
    }
}

export default Core;
export { APP_STATE, PREPARE_PROGRESS, Storage };
