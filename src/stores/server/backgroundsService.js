import { action, makeAutoObservable, reaction, toJS } from 'mobx';
import {
    BG_CHANGE_INTERVAL,
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
    bgState;
    prepareBgState = BG_SHOW_STATE.WAIT;
    _schedulerTimer;
    _fetchCount = 0;

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
                this.bgShowMode = bg.pause ? BG_SHOW_MODE.STATIC : BG_SHOW_MODE.LIVE;
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
            if (
                this.settings.selectionMethod === BG_SELECT_MODE.STREAM
                && !this.storage.prepareBGStream
                && this.prepareBgState === BG_SHOW_STATE.WAIT
            ) {
                console.log('[backgrounds] Request for prepare next background');
                this.prepareNextBGStream();
            }
        });

        this.core.globalBus.on('backgrounds/setBg', ({ bg }, callback) => {
            this.setBG(bg).finally(callback)
        });

        this.core.globalBus.on('backgrounds/play', async (data, props, callback) => {
            console.log('backgrounds/play', data);
            try {
                const result = await this.play(data);

                callback({ success: true, result });
            } catch (e) {
                callback({ success: false, result: e });
            }
        });

        this.core.globalBus.on('backgrounds/pause', async (data, props, callback) => {
            console.log('backgrounds/pause', data);
            try {
                const result = await this.pause(data);

                callback({ success: true, result });
            } catch (e) {
                callback({ success: false, result: e });
            }
        });

        reaction(
            () => this.settings.type,
            () => this.nextBG(),
        );

        reaction(
            () => this.settings.changeInterval,
            () => this._runScheduler(),
        );
        reaction(
            () => this.storage.bgCurrent?.id,
            () => this._runScheduler(),
        );

        if (this.settings.changeInterval) this._schedulerSwitch();
    }

    @action('run scheduler')
    async _runScheduler() {
        if (this.settings.changeInterval === BG_CHANGE_INTERVAL.OPEN_TAB) return;

        try {
            console.log('[backgrounds] Run scheduler...')
            this.core.storageService.updatePersistent({ bgNextSwitchTimestamp: Date.now() + BG_CHANGE_INTERVAL_MILLISECONDS[this.settings.changeInterval] });
            await this._schedulerSwitch();
        } catch (e) {
            console.error('[backgrounds] Failed change interval', e)
        }
    }

    @action('scheduler switch')
    async _schedulerSwitch() {
        if (this.settings.changeInterval === BG_CHANGE_INTERVAL.OPEN_TAB) return;
        console.log(`[backgrounds] Call scheduler switch`);
        if (!this.storage?.bgNextSwitchTimestamp || this.storage.bgNextSwitchTimestamp <= Date.now()) {
            console.log('[backgrounds] Run switch scheduler...')
            await this.nextBG();
            return Promise.resolve();
        }

        clearTimeout(this._schedulerTimer);
        console.log(`[backgrounds] Set scheduler switch`);
        this._schedulerTimer = setTimeout(
            () => this._schedulerSwitch(),
            this.storage.bgNextSwitchTimestamp - Date.now(),
        );
        console.log(`[backgrounds] Set scheduler switch. Run after ${this.storage.bgNextSwitchTimestamp - Date.now()}ms`);
    }

    @action('prepare next bg stream')
    prepareNextBGStream() {
        console.log(`[backgrounds] Prepare next background stream request`);

        return this.nextBGStream(true);
    }

    @action('next bg')
    nextBG() {
        console.log(`[backgrounds] Next background request. Selection method: ${this.settings.selectionMethod}`)

        eventToApp('backgrounds/state', { state: BG_SHOW_STATE.SEARCH });

        if (this.settings.selectionMethod === BG_SELECT_MODE.RANDOM) {
            return this.nextBGLocal();
        } else if (this.settings.selectionMethod === BG_SELECT_MODE.STREAM) {
            return this.nextBGStream();
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

    @action('next bg stream')
    async nextBGStream(isPrepare = false) {
        if (this.prepareBgState !== BG_SHOW_STATE.WAIT) {
            console.log('[backgrounds] Load prepare background. Wait...');
            this.bgState = BG_SHOW_STATE.SEARCH;

            return;
        }

        if (this.storage.prepareBGStream) {
            console.log('[backgrounds] Set prepare background...');

            const setBG = this.storage.prepareBGStream;

            this.core.storageService.updatePersistent({
                prepareBGStream: null,
            });

            await this.setBG(setBG);

            return Promise.resolve();
        }

        console.log('[backgrounds] Search next background from stream station...')
        if (!this.storage.backgroundStreamQuery) {
            console.log('[backgrounds] Not set stream query. Set default...');
            this.core.storageService.updatePersistent({
                backgroundStreamQuery: {
                    type: 'collection',
                    id: 'EDITORS_СHOICE',
                },
            });
        }
        if (!isPrepare) this.bgState = BG_SHOW_STATE.SEARCH;
        else this.prepareBgState = BG_SHOW_STATE.SEARCH;

        this._fetchCount += 1;

        if (this._fetchCount > 4) {
            const timeout = Math.min(this._fetchCount * 1000, 30000);
            console.log(`[backgrounds] Many failed requests, wait ${timeout}ms`)
            await new Promise((resolve) => setTimeout(resolve, timeout))
        }

        const setFromQueue = async (queue) => {
            let fileName;

            if (queue.length === 0) {
                return this.nextBGStream(isPrepare);
            }

            try {
                fileName = await Service.fetchBG(first(queue).downloadLink);
            } catch (e) {
                console.error('[backgrounds] Failed get background. Get next...', e);

                this.core.storageService.updatePersistent({
                    bgsStream: queue.splice(1),
                });

                return this.nextBGStream(isPrepare)
            }

            const currBg = new Background({
                ...first(queue),
                fileName,
                isLoad: true,
            });

            this.core.storageService.updatePersistent({
                bgsStream: queue.splice(1),
                [isPrepare ? 'prepareBGStream' : 'currentBGStream']: currBg,
            });

            this._fetchCount = 0;
            if (!isPrepare) await this.setBG(new Background(currBg));
            else {
                let fileName;

                try {
                    fileName = await Service.fetchBG(currBg.downloadLink);
                } catch (e) {
                    console.error('[backgrounds] Failed get background. Get next...', e);

                    return Promise.reject();
                }

                this.core.storageService.updatePersistent({
                    prepareBGStream: new Background({
                        ...currBg,
                        fileName,
                        isLoad: true,
                    }),
                });

                this.prepareBgState = BG_SHOW_STATE.WAIT;

                if (this.bgState === BG_SHOW_STATE.SEARCH) {
                    console.log('[backgrounds] Search next background. Reload worker...')
                    return this.nextBGStream(isPrepare);
                }
            }
        };

        if (this.storage.bgsStream?.length > appVariables.backgrounds.stream.preloadBGCount) {
            const bgRemove = first(this.storage.bgsStream);
            await Service.removeFromStore(bgRemove);

            await setFromQueue(this.storage.bgsStream);

            return Promise.resolve();
        }

        try {
            const { response } = await fetchData(`${
                appVariables.rest.url
            }/backgrounds/${
                this.storage.backgroundStreamQuery?.type === 'collection' ? 'get-from-collection' : 'get-random'
            }?type=${this.settings.type.join(',').toLowerCase()}${
                this.storage.backgroundStreamQuery?.type === 'collection'
                    ? ''
                    : `&query=${this.storage.backgroundStreamQuery?.value || ""}`
            }&count=${appVariables.backgrounds.stream.preloadMetaCount}`);

            if (response.length === 0) {
                console.log('[backgrounds] Backgrounds not found');
                if (!isPrepare) eventToApp('backgrounds/state', { state: BG_SHOW_STATE.NOT_FOUND });
                else this.prepareBgState = BG_SHOW_STATE.WAIT;

                return;
            }

            console.log('[backgrounds] Download next queue backgrounds', response);

            await setFromQueue([
                ...(this.storage.bgsStream || []),
                ...response.map((bg) => new Background({
                    ...bg,
                    originId: bg.bgId,
                    source: BG_SOURCE[bg.service],
                    type: BG_TYPE[bg.type],
                    downloadLink: bg.fullSrc,
                }))
            ]);
        } catch (e) {
            console.log('[backgrounds] Failed get backgrounds', e);
            if (!isPrepare) eventToApp('backgrounds/state', { state: BG_SHOW_STATE.NOT_FOUND });
            else this.prepareBgState = BG_SHOW_STATE.NOT_FOUND;
        }
    }

    @action('set bg')
    async setBG(setBG) {
        console.log('[backgrounds] Set background', setBG);

        if (!setBG.fileName) {
            console.log('[backgrounds] Bg not load background. Fetch...');
            let fileName;

            try {
                fileName = await Service.fetchBG(setBG.downloadLink);
            } catch (e) {
                console.error('[backgrounds] Failed get background. Get next...', e);

                return Promise.reject();
            }

            return this.setBG(new Background({
                ...setBG,
                fileName,
                isLoad: true,
            }));
        }

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
                bgCurrent: null,
            });

            this.bgState = BG_SHOW_STATE.NOT_FOUND;
            eventToApp('backgrounds/state', { state: BG_SHOW_STATE.NOT_FOUND });

            return Promise.resolve();
        }

        if (this.bgShowMode === BG_SHOW_MODE.STATIC) setBG.pauseTimestamp = -0.5;

        this._currentBG = setBG;
        this.currentBGId = this._currentBG.id;

        this.core.storageService.updatePersistent({
            bgCurrent: { ...setBG },
        });

        this.bgState = BG_SHOW_STATE.DONE;
        eventToApp('backgrounds/state', { state: BG_SHOW_STATE.DONE });

        return Promise.resolve();
    }

    @action('play bg')
    play() {
        this._currentBG.pause = false;
        this.bgShowMode = BG_SHOW_MODE.LIVE;

        this.core.storageService.updatePersistent({
            bgCurrent: new Background({
                ...this._currentBG,
                pauseTimestamp: null,
                pauseStubSrc: null,
            }),
            bgShowMode: BG_SHOW_MODE.LIVE,
        });
        FSConnector.removeFile(BackgroundsUniversalService.FULL_PATH, 'temporaryVideoFrame').catch(() => {});

        return true;
    }

    @action('pause bg')
    async pause({ bgId, timestamp }) {
        console.log('pause bg:', this.currentBGId, toJS((this)))
        if (bgId !== this.currentBGId) return Promise.reject(ERRORS.ID_BG_IS_CHANGED);

        this._currentBG.pauseTimestamp = timestamp;
        this.bgShowMode = BG_SHOW_MODE.STATIC;

        this.core.storageService.updatePersistent({
            bgCurrent: this._currentBG,
            bgShowMode: BG_SHOW_MODE.STATIC,
        });
        const frame = await getPreview(
            FSConnector.getBGURL(this._currentBG.fileName),
            this._currentBG.type,
            {
                size: 'full',
                timeStamp: timestamp,
            },
        );

        if (bgId !== this.currentBGId || this.bgShowMode !== BG_SHOW_MODE.STATIC) throw ERRORS.ID_BG_IS_CHANGED;

        await FSConnector.saveFile(BackgroundsUniversalService.FULL_PATH, frame, 'temporaryVideoFrame');

        this._currentBG.pauseStubSrc = FSConnector.getBGURL('temporaryVideoFrame');

        this.core.storageService.updatePersistent({
            bgCurrent: this._currentBG,
        });

        return true;
    }
}

export default BackgroundsServerService;
