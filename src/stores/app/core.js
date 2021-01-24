import BusApp, { eventToBackground, initBus, instanceId } from '@/stores/server/bus';
import { BG_SOURCE, BG_TYPE, DESTINATION } from '@/enum';
import { reaction, action, makeAutoObservable, runInAction } from 'mobx';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import { open as openDB } from '@/utils/dbConnector';
import appVariables from '@/config/appVariables';
import FSConnector from '@/utils/fsConnector';
import EventBus from '@/utils/eventBus';
import { assign, first } from 'lodash';
import Background from '@/stores/universal/backgrounds/entities/background';
import BackgroundsUniversalService from '@/stores/universal/backgrounds/service';
import fetchData from '@/utils/xhrPromise';

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

                runInAction(() => {
                    if (!this.storage.persistent.lastUsageVersion) {
                        this.appState = APP_STATE.REQUIRE_SETUP;
                    } else {
                        this.appState = APP_STATE.WORK;
                    }
                });
            } catch (e) {
                runInAction(() => {
                    this.appState = APP_STATE.FAILED;
                });
            }
        };

        this.globalEventBus.on('system/ping', (data, options, callback) => {
            callback({ type: data });
        });

        reaction(() => this.storage.isSync, () => { init(); });

        if (this.storage.isSync) init();
    }

    async initialization() {
        await i18n
            .use(initReactI18next)
            .use(LanguageDetector)
            .use(Backend)
            .init({
                load: 'languageOnly',
                fallbackLng: PRODUCTION_MODE ? 'en' : 'dev',
                debug: !PRODUCTION_MODE,
                interpolation: { escapeValue: false },
                backend: { loadPath: 'resource/i18n/{{lng}}.json' },
            });

        await openDB();
    }

    async setDefaultState(progressCallback) {
        console.log('Create FS');
        progressCallback(5, PREPARE_PROGRESS.CREATE_FS);
        await FSConnector.createFS();

        console.log('Fetch BG');
        progressCallback(10, PREPARE_PROGRESS.FETCH_BG);

        const { response } = await fetchData(`${appVariables.rest.url}/backgrounds/get-from-collection?count=1&type=image&collection=best`);

        progressCallback(30, PREPARE_PROGRESS.FETCH_BG);

        let bg

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

        this.storage.updatePersistent({
            bgCurrent: bg,
        });

        this.appState = APP_STATE.WORK;

        console.log('DONE');
        progressCallback(100, PREPARE_PROGRESS.DONE);

        return Promise.resolve();
    }
}

export default Core;
export { APP_STATE, PREPARE_PROGRESS, Storage };
