import BusApp, { eventToBackground, initBus, instanceId } from '@/stores/backgroundApp/busApp';
import { DESTINATION } from '@/enum';
import { reaction, action, makeAutoObservable } from 'mobx';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import DBConnector, { open as openDB } from '@/utils/dbConnector';
import appVariables from '@/config/appVariables';
import defaultSettings from '@/config/settings';
import createPreview from '@/utils/createPreview';
import FSConnector from '@/utils/fsConnector';
import EventBus from '@/utils/eventBus';
import { assign } from 'lodash';

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

        const init = () => {
            if (!this.storage.isSync) return;

            this.initialization()
                .then(() => {
                    if (!this.storage.persistent.lastUsageVersion) {
                        this.appState = APP_STATE.REQUIRE_SETUP;
                    } else {
                        this.appState = APP_STATE.WORK;
                    }
                })
                .catch(() => { this.appState = APP_STATE.FAILED; });
        };

        init();

        reaction(() => this.storage.isSync, () => { init(); });
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
        /* const backgrounds = await DBConnector().getAll('backgrounds');

        if (backgrounds.length !== 0) return Promise.resolve(); */

        const fileName = Date.now().toString();

        console.log('Fetch BG');
        progressCallback(10, PREPARE_PROGRESS.FETCH_BG);
        const defaultBG = await fetch(appVariables.defaultBG.src).then((response) => response.blob());
        console.log('Create preview BG');
        progressCallback(90, PREPARE_PROGRESS.SAVE_BG);
        const previewDefaultBG = await createPreview(defaultBG);

        console.log('Save BG');
        await FSConnector.saveFile('/backgrounds/full', defaultBG, fileName);
        await FSConnector.saveFile('/backgrounds/preview', previewDefaultBG, fileName);

        const bgId = await DBConnector().add('backgrounds', {
            ...appVariables.defaultBG,
            fileName,
        });

        this.storage.updatePersistent({
            bgCurrent: {
                ...appVariables.defaultBG,
                fileName,
                id: bgId,
            },
        });

        this.appState = APP_STATE.WORK;

        console.log('DONE');
        progressCallback(100, PREPARE_PROGRESS.DONE);

        return Promise.resolve();
    }
}

export default Core;
export { APP_STATE, PREPARE_PROGRESS, Storage };
