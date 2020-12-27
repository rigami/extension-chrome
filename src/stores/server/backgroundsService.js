import { action, makeAutoObservable, reaction } from 'mobx';
import {
    BG_CHANGE_INTERVAL_MILLISECONDS,
    BG_SELECT_MODE,
    BG_SHOW_MODE,
    BG_SHOW_STATE,
    BG_SOURCE,
    BG_TYPE
} from '@/enum';
import Background from '@/stores/universal/backgrounds/entities/background';
import DBConnector from '@/utils/dbConnector';
import { first } from 'lodash';
import appVariables from '@/config/appVariables';
import fetchData from '@/utils/xhrPromise';
import FSConnector from '@/utils/fsConnector';
import Service, { ERRORS } from '@/stores/universal/backgrounds/service';
import getPreview from '@/utils/createPreview';
import { eventToApp } from '@/stores/server/bus';
import BackgroundsUniversalService from '@/stores/universal/backgrounds/service';

class BackgroundsServerService {
    core;
    storage;
    settings;
    _schedulerTimer;

    constructor(core) {
        makeAutoObservable(this);
        this.core = core;
        this.storage = this.core.storageService.storage;
        this.settings = this.core.settingsService.settings.backgrounds;

        console.log('[backgrounds] Check settings & storage', this.storage, this.settings)

        try {
            if (
                this.storage.bgNextSwitchTimestamp > Date.now()
                || this.settings.selectionMethod === BG_SELECT_MODE.SPECIFIC
            ) {
                console.log('[backgrounds] Restore current background...');
                this.bgState = BG_SHOW_STATE.DONE;

                const bg = new Background(this.storage.bgCurrent);

                this._currentBG = bg;
                this.bgMode = bg.pause ? BG_SHOW_MODE.STATIC : BG_SHOW_MODE.LIVE;
                this.currentBGId = this._currentBG.id;
            } else {
                console.log('[backgrounds] Current background is expired. Change to next...');
                this.nextBG();
            }
        } catch (e) {
            console.error('[backgrounds] Error check current background. Change to next...', e);
            this.nextBG();
        }

        this.core.globalBus.on('backgrounds/nextBg', () => this.nextBG());

        this.core.globalBus.on('backgrounds/prepareNextBg', () => {
            console.log('[backgrounds] Request for prepare next background');
        });

        this.core.globalBus.on('backgrounds/setBg', ({ bg }, callback) => {
            this.setBG(bg).finally(callback)
        });

        reaction(
            () => this.settings.type,
            () => this.nextBG(),
        );

        reaction(
            () => this.settings.changeInterval,
            () => {
                try {
                    this.core.storageService.updatePersistent({ bgNextSwitchTimestamp: Date.now() + BG_CHANGE_INTERVAL_MILLISECONDS[this.settings.changeInterval] });
                    this._schedulerSwitch();
                } catch (e) {
                    console.error('[backgrounds] Failed change interval', e)
                }
            },
        );

        if (this.settings.changeInterval) this._schedulerSwitch();
    }

    @action('next bg')
    async _schedulerSwitch() {
        console.log()
        if (this.storage.bgNextSwitchTimestamp <= Date.now()) {
            console.log('[backgrounds] Run switch scheduler...')
            await this.nextBG();
        }

        clearTimeout(this._schedulerTimer);
        this._schedulerTimer = setTimeout(this._schedulerSwitch, this.storage.bgNextSwitchTimestamp - Date.now());
        console.log(`[backgrounds] Set scheduler switch. Run after ${this.storage.bgNextSwitchTimestamp - Date.now()}ms`);
    }

    @action('next bg')
    nextBG() {
        console.log('[backgrounds] Next background request')

        eventToApp('backgrounds/state', { state: BG_SHOW_STATE.SEARCH });

        if (this.settings.selectionMethod === BG_SELECT_MODE.RANDOM) {
            return this.nextBGLocal();
        } else if (this.settings.selectionMethod === BG_SELECT_MODE.RADIO) {
            return this.nextBGRadio();
        }
    }

    @action('next bg local')
    async nextBGLocal() {
        console.log('[backgrounds] Search next background from local library...')
        this.bgState = BG_SHOW_STATE.SEARCH;
        const bgs = (await Promise.all(this.settings.type.map((type) => (
            DBConnector().getAllFromIndex('backgrounds', 'type', type)
        )))).flat();

        if (bgs.length === 0) {
            return await this.setBG(null);
        }

        const bgPos = Math.floor(Math.random() * bgs.length);

        let bg = bgs[bgPos];

        if (bg.id === this.currentBGId) {
            if (bgPos === 0) {
                bg = bgs[Math.min(bgPos + 1, bgs.length - 1)];
            } else {
                bg = bgs[Math.max(bgPos - 1, 0)];
            }
        }

        if (bg) await this.setBG(bg);
    }

    @action('next bg radio')
    async nextBGRadio() {
        console.log('[backgrounds] Search next background from radio station...')
        this.bgState = BG_SHOW_STATE.SEARCH;

        const setFromQueue = async (queue) => {
            let fileName;

            try {
                fileName = await Service.fetchBG(first(queue).downloadLink);
            } catch (e) {
                console.error('[backgrounds] Failed get background. Get next...', e);

                this.core.storageService.updatePersistent({
                    bgsRadio: queue.splice(1),
                });

                return this.nextBGRadio()
            }

            const currBg = new Background({
                ...first(queue),
                fileName,
                isLoad: true,
            });

            this.core.storageService.updatePersistent({
                bgsRadio: queue.splice(1),
                currentBGRadio: currBg,
            });

            await this.setBG(new Background(currBg));
        };

        if (this.storage.bgsRadio?.length > appVariables.backgrounds.radio.preloadBGCount) {
            const bgRemove = first(this.storage.bgsRadio);
            await Service.removeFromStore(bgRemove);

            await setFromQueue(this.storage.bgsRadio);

            return Promise.resolve();
        }

        try {
            const { response } = await fetchData(`${
                appVariables.rest.url
            }/backgrounds/${
                this.storage.backgroundRadioQuery?.type === 'collection' ? 'get-from-collection' : 'get-random'
            }?type=${this.settings.type.join(',').toLowerCase()}${
                this.storage.backgroundRadioQuery?.type === 'collection'
                    ? ''
                    : `&query=${this.storage.backgroundRadioQuery?.value || ""}`
            }&count=${appVariables.backgrounds.radio.preloadMetaCount}`);

            console.log('[backgrounds] Download next queue backgrounds', response);

            await setFromQueue([
                ...(this.storage.bgsRadio || []),
                ...response.map((bg) => new Background({
                    ...bg,
                    source: BG_SOURCE[bg.service],
                    type: BG_TYPE[bg.type],
                    downloadLink: bg.fullSrc,
                }))
            ]);
        } catch (e) {
            console.log('[backgrounds] Failed get backgrounds', e);
            eventToApp('backgrounds/state', { state: BG_SHOW_STATE.NOT_FOUND });
        }
    }

    @action('set bg')
    async setBG(setBG) {
        console.log('[backgrounds] Set background', setBG);
        if (this.currentBGId === setBG?.id) {
            this.bgState = BG_SHOW_STATE.DONE;
            eventToApp('backgrounds/state', { state: BG_SHOW_STATE.DONE });
            return Promise.resolve();
        }

        if (!setBG) {
            console.log('Error set bg')
            this._currentBG = null;
            this.currentBGId = null;

            this.core.storageService.updatePersistent({
                bgNextSwitchTimestamp: Date.now() + BG_CHANGE_INTERVAL_MILLISECONDS[this.settings.changeInterval],
                bgCurrent: null,
            });

            this.bgState = BG_SHOW_STATE.NOT_FOUND;
            eventToApp('backgrounds/state', { state: BG_SHOW_STATE.NOT_FOUND });

            return Promise.resolve();
        }

        this._currentBG = setBG;
        this.currentBGId = this._currentBG.id;

        this.core.storageService.updatePersistent({
            bgNextSwitchTimestamp: Date.now() + BG_CHANGE_INTERVAL_MILLISECONDS[this.settings.changeInterval],
            bgCurrent: { ...setBG },
        });

        this.bgState = BG_SHOW_STATE.DONE;
        eventToApp('backgrounds/state', { state: BG_SHOW_STATE.DONE });

        return Promise.resolve();
    }

    @action('play bg')
    play() {
        this._currentBG.pause = false;
        this.bgMode = BG_SHOW_MODE.LIVE;

        this.core.storageService.updatePersistent({ bgCurrent: { ...this._currentBG } });
        FSConnector.removeFile(BackgroundsUniversalService.FULL_PATH, 'temporaryVideoFrame').catch(() => {});

        return this._currentBG;
    }

    @action('pause bg')
    async pause(captureBgId, timestamp) {
        if (captureBgId !== this.currentBGId) return Promise.reject(ERRORS.ID_BG_IS_CHANGED);

        this._currentBG.pause = timestamp;
        this.bgMode = BG_SHOW_MODE.STATIC;

        this.core.storageService.updatePersistent({ bgCurrent: { ...this._currentBG } });
        const frame = await getPreview(
            FSConnector.getBGURL(this._currentBG.fileName),
            this._currentBG.type,
            {
                size: 'full',
                timeStamp: timestamp,
            },
        );

        if (captureBgId !== this.currentBGId) throw ERRORS.ID_BG_IS_CHANGED;

        await FSConnector.saveFile(BackgroundsUniversalService.FULL_PATH, frame, 'temporaryVideoFrame');

        return this._currentBG;
    }
}

export default BackgroundsServerService;
