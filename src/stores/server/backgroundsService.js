import {
    action,
    makeAutoObservable,
    reaction,
    toJS,
} from 'mobx';
import {
    BG_CHANGE_INTERVAL,
    BG_CHANGE_INTERVAL_MILLISECONDS,
    BG_SELECT_MODE,
    BG_SHOW_MODE,
    BG_SHOW_STATE,
    BG_SOURCE,
    BG_TYPE,
    FETCH,
} from '@/enum';
import Background from '@/stores/universal/backgrounds/entities/background';
import DBConnector from '@/utils/dbConnector';
import { first } from 'lodash';
import appVariables from '@/config/appVariables';
import fetchData from '@/utils/xhrPromise';
import FSConnector from '@/utils/fsConnector';
import BackgroundsUniversalService, { ERRORS } from '@/stores/universal/backgrounds/service';
import getPreview from '@/utils/createPreview';
import { eventToApp } from '@/stores/server/bus';

class BackgroundsServerService {
    core;
    storage;
    settings;
    bgState;
    prepareBgState = BG_SHOW_STATE.WAIT;
    _schedulerTimer;
    _fetchCount = 0;
    _queueIsPreloaded = false;

    constructor(core) {
        makeAutoObservable(this);
        this.core = core;
        this.storage = this.core.storageService.storage;
        this.settings = this.core.settingsService.settings.backgrounds;

        this.subscribe();
    }

    @action('run scheduler')
    async _runScheduler() {
        if (this.settings.changeInterval === BG_CHANGE_INTERVAL.OPEN_TAB) return;

        try {
            console.log('[backgrounds] Update scheduler...');
            const bgNextSwitchTimestamp = Date.now() + BG_CHANGE_INTERVAL_MILLISECONDS[this.settings.changeInterval];

            this.core.storageService.updatePersistent({ bgNextSwitchTimestamp });
            await this._schedulerSwitch();
        } catch (e) {
            console.error('[backgrounds] Failed change interval', e);
        }
    }

    @action('scheduler switch')
    async _schedulerSwitch() {
        if (this.settings.changeInterval === BG_CHANGE_INTERVAL.OPEN_TAB) return Promise.resolve();
        console.log('[backgrounds] Call scheduler switch');
        if (!this.storage?.bgNextSwitchTimestamp || this.storage.bgNextSwitchTimestamp <= Date.now()) {
            console.log('[backgrounds] Run switch scheduler...');
            await this.nextBG();
            return Promise.resolve();
        }

        clearTimeout(this._schedulerTimer);
        this._schedulerTimer = setTimeout(
            () => this._schedulerSwitch(),
            this.storage.bgNextSwitchTimestamp - Date.now(),
        );
        console.log(`[backgrounds] Set scheduler switch. Run after ${
            this.storage.bgNextSwitchTimestamp - Date.now()
        }ms`);
        return Promise.resolve();
    }

    @action('next bg')
    nextBG() {
        console.log(`[backgrounds] Next background request. Selection method: ${this.settings.selectionMethod}`);
        if (this.bgState === BG_SHOW_STATE.SEARCH) {
            console.log('[backgrounds] Background already searching. Skip...');
            return Promise.resolve();
        }
        if (this.settings.selectionMethod === BG_SELECT_MODE.SPECIFIC) {
            console.log(`[backgrounds] Selection method ${this.settings.selectionMethod} not support. Abort...`);
            return Promise.resolve();
        }

        eventToApp('backgrounds/state', { state: BG_SHOW_STATE.SEARCH });

        if (this.settings.selectionMethod === BG_SELECT_MODE.RANDOM) {
            return this.nextBGLocal();
        } else if (this.settings.selectionMethod === BG_SELECT_MODE.STREAM) {
            return this.nextBGStream();
        }

        return Promise.resolve();
    }

    @action('next bg local')
    async nextBGLocal() {
        console.log('[backgrounds] Search next background from local library...');
        this.bgState = BG_SHOW_STATE.SEARCH;
        const bgs = (await Promise.all(this.settings.type.map((type) => (
            DBConnector().getAllFromIndex('backgrounds', 'type', type)
        )))).flat();

        if (bgs.length === 0) {
            return this.setBG(null);
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

        if (bg) return this.setBG(bg);

        return Promise.resolve();
    }

    @action('prepare queue')
    async _prepareQueue(fetchIndex = 0) {
        if (this.storage.bgsStream.length === 0) {
            console.log('[backgrounds] Backgrounds is over, preload new ones...');
            return this._preloadQueue();
        }
        console.log(`[backgrounds] Prefetch backgrounds. Now ${
            fetchIndex + 1
        } from ${
            this.storage.bgsStream.length
        }...`);

        if (this.core.isOffline) {
            console.log('[backgrounds] App is offline. Impossible prefetch bg. Abort...');
            return Promise.resolve();
        }

        const currBg = this.storage.bgsStream[fetchIndex];
        let fileName;

        if (
            fetchIndex + 1 <= appVariables.backgrounds.stream.prefetchCount
            && fetchIndex <= this.storage.bgsStream.length - 1
        ) {
            if (currBg.state === FETCH.PENDING || currBg.state === FETCH.DONE) {
                console.log('[backgrounds] Backgrounds already fetch or fetching. Skip...');
                return this._prepareQueue(fetchIndex + 1);
            }
        } else {
            console.log('[backgrounds] Prefetch enough backgrounds. Stopping');

            if (this.storage.bgsStream.length < appVariables.backgrounds.stream.prefetchCount) {
                console.log('[backgrounds] Backgrounds are almost over, preload new ones...');
                return this._preloadQueue();
            } else {
                return Promise.resolve();
            }
        }

        this.core.storageService.updatePersistent({
            bgsStream: this.storage.bgsStream.map((bg) => {
                if (bg.downloadLink !== currBg.downloadLink) return bg;

                return {
                    ...bg,
                    state: FETCH.PENDING,
                };
            }),
        });

        try {
            fileName = await BackgroundsUniversalService.fetchBG(currBg.downloadLink, { preview: false });
        } catch (e) {
            console.error('[backgrounds] Failed get background. Remove from queue and fetch next...', e);

            this.core.storageService.updatePersistent({ bgsStream: this.storage.bgsStream.splice(fetchIndex, 1) });

            return this._prepareQueue(fetchIndex);
        }

        this.core.storageService.updatePersistent({
            bgsStream: this.storage.bgsStream.map((bg) => {
                if (bg.downloadLink !== currBg.downloadLink) return bg;

                return {
                    ...bg,
                    fileName,
                    state: FETCH.DONE,
                };
            }),
        });

        if (
            fetchIndex < appVariables.backgrounds.stream.prefetchCount
            && fetchIndex < this.storage.bgsStream.length - 1
        ) {
            return this._prepareQueue(fetchIndex + 1);
        } else {
            console.log('[backgrounds] Prefetch enough backgrounds. Stopping');
            if (this.storage.bgsStream.length < appVariables.backgrounds.stream.prefetchCount) {
                console.log('[backgrounds] Backgrounds are almost over, preload new ones...');
                return this._preloadQueue();
            } else {
                return Promise.resolve();
            }
        }
    }

    @action('set bg from queue')
    async _setFromQueue() {
        let fileName;

        if (this.core.isOffline && !first(this.storage.bgsStream)?.fileName) {
            console.log('[backgrounds] App is offline and next bg not prefetch. Get background from local store...');
            this._fetchCount = 0;
            return this.nextBGLocal();
        }

        if (first(this.storage.bgsStream).fileName) {
            fileName = first(this.storage.bgsStream).fileName;
        } else {
            try {
                fileName = await BackgroundsUniversalService.fetchBG(
                    first(this.storage.bgsStream).downloadLink,
                    { preview: false },
                );
            } catch (e) {
                console.error('[backgrounds] Failed get background. Get next...', e);

                this.core.storageService.updatePersistent({ bgsStream: this.storage.bgsStream.splice(1) });

                return this.nextBGStream();
            }
        }

        const currBg = new Background({
            ...first(this.storage.bgsStream),
            fileName,
            isLoad: true,
        });

        this.core.storageService.updatePersistent({
            bgsStream: this.storage.bgsStream.splice(1),
            currentBGStream: currBg,
        });

        this._fetchCount = 0;
        await this.setBG(new Background(currBg));
        return this._prepareQueue();
    }

    @action('preload queue')
    async _preloadQueue(force = false) {
        if (!force && this._queueIsPreloaded) {
            console.warn('[backgrounds] Queue already preload. Abort...');
            return Promise.resolve();
        }

        if (!force) this._queueIsPreloaded = true;
        console.warn(`[backgrounds] Preload queue... Is force: ${force}`);
        const place = this.storage.backgroundStreamQuery?.type === 'collection'
            ? 'get-from-collection'
            : 'get-random';
        const type = this.settings.type.join(',').toLowerCase();
        let query = this.storage.backgroundStreamQuery?.type !== 'collection'
            ? `&query=${this.storage.backgroundStreamQuery?.value || ''}`
            : '';
        query = `${query}&count=${appVariables.backgrounds.stream.preloadMetaCount}`;

        try {
            const { response } = await fetchData(`${appVariables.rest.url}/backgrounds/${place}?type=${type}${query}`);

            if (response.length === 0) {
                console.log('[backgrounds] Response empty');

                if (!force) this._queueIsPreloaded = false;
                return Promise.reject();
            }

            this._fetchCount = 0;
            this.core.storageService.updatePersistent({
                bgsStream: [
                    ...(this.storage.bgsStream || []),
                    ...response.map((bg) => new Background({
                        ...bg,
                        originId: bg.bgId,
                        source: BG_SOURCE[bg.service],
                        type: BG_TYPE[bg.type],
                        downloadLink: bg.fullSrc,
                    })),
                ],
            });
            if (!force) this._queueIsPreloaded = false;
            return Promise.resolve();
        } catch (e) {
            if (!force) this._queueIsPreloaded = false;
            return Promise.reject(e);
        }
    }

    @action('next bg stream')
    async nextBGStream() {
        if (this.prepareBgState === BG_SHOW_STATE.SEARCH) {
            console.log('[backgrounds] Load prepare background. Wait...');
            this.bgState = BG_SHOW_STATE.SEARCH;

            return Promise.resolve();
        }

        console.log('[backgrounds] Search next background from stream station...');
        if (!this.storage.backgroundStreamQuery) {
            console.log('[backgrounds] Not set stream query. Set default...');
            this.core.storageService.updatePersistent({
                backgroundStreamQuery: {
                    type: 'collection',
                    id: 'EDITORS_CHOICE',
                },
            });
        }
        this.bgState = BG_SHOW_STATE.SEARCH;
        this._fetchCount += 1;

        if (this._fetchCount > 4) {
            const timeout = Math.min(this._fetchCount * 1000, 30000);
            console.log(`[backgrounds] Many failed requests, wait ${timeout}ms`);
            await new Promise((resolve) => setTimeout(resolve, timeout));
        }

        if (this.storage.bgsStream?.length > 0) {
            return this._setFromQueue();
        }

        if (this.core.isOffline) {
            console.log('[backgrounds] App is offline. Get background from local store...');
            this._fetchCount = 0;
            return this.nextBGLocal();
        }

        try {
            await this._preloadQueue(true);

            return this._setFromQueue();
        } catch (e) {
            console.log('[backgrounds] Failed get backgrounds', e);
            this.bgState = BG_SHOW_STATE.NOT_FOUND;
            eventToApp('backgrounds/state', { state: BG_SHOW_STATE.NOT_FOUND });
        }

        return Promise.resolve();
    }

    @action('set bg')
    async setBG(setBG) {
        console.log('[backgrounds] Set background', setBG);

        if (setBG && !setBG?.fileName) {
            console.log('[backgrounds] Bg not load background. Fetch...');
            let fileName;

            try {
                fileName = await BackgroundsUniversalService.fetchBG(setBG.downloadLink, { preview: false });
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
            console.log('Error set bg');
            this._currentBG = null;
            this.currentBGId = null;

            this.core.storageService.updatePersistent({ bgCurrent: null });

            this.bgState = BG_SHOW_STATE.NOT_FOUND;
            eventToApp('backgrounds/state', { state: BG_SHOW_STATE.NOT_FOUND });

            return Promise.resolve();
        }

        if (this.bgShowMode === BG_SHOW_MODE.STATIC) setBG.pauseTimestamp = -0.5;

        const isSaved = (await DBConnector().count('backgrounds', setBG.id)) !== 0;

        this._currentBG = setBG;
        this.currentBGId = this._currentBG.id;

        this.core.storageService.updatePersistent({
            bgCurrent: {
                ...setBG,
                isSaved,
            },
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
        console.log('pause bg:', this.currentBGId, toJS((this)));
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

        this.core.storageService.updatePersistent({ bgCurrent: this._currentBG });

        return true;
    }

    subscribe() {
        try {
            if (this.storage.lastUsageVersion) {
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
            }
        } catch (e) {
            console.error('[backgrounds] Error check current background. Change to next...', e);
            this.nextBG();
        }

        this.core.globalBus.on('backgrounds/nextBg', () => this.nextBG());

        this.core.globalBus.on('backgrounds/setBg', ({ bg }, callback) => {
            this.setBG(bg).finally(callback);
        });

        this.core.globalBus.on('backgrounds/play', async (data, props, callback) => {
            console.log('backgrounds/play', data);
            try {
                const result = await this.play(data);

                callback({
                    success: true,
                    result,
                });
            } catch (e) {
                callback({
                    success: false,
                    result: e,
                });
            }
        });

        this.core.globalBus.on('backgrounds/pause', async (data, props, callback) => {
            console.log('backgrounds/pause', data);
            try {
                const result = await this.pause(data);

                callback({
                    success: true,
                    result,
                });
            } catch (e) {
                callback({
                    success: false,
                    result: e,
                });
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

        reaction(
            () => first(this.storage.bgsStream)?.state,
            () => {
                const bg = first(this.storage.bgsStream);

                if (!bg) return;

                if (bg.state === FETCH.PENDING) {
                    this.prepareBgState = BG_SHOW_STATE.SEARCH;
                } else if (bg.state === FETCH.DONE) {
                    this.prepareBgState = BG_SHOW_STATE.DONE;
                    if (this.bgState === BG_SHOW_STATE.SEARCH) {
                        console.log('[backgrounds] Search next background. Reload worker...');
                        this.nextBGStream().catch(console.error);
                    }
                } else {
                    this.prepareBgState = BG_SHOW_STATE.WAIT;
                }
            },
        );

        if (this.settings.changeInterval && this.storage.lastUsageVersion) this._schedulerSwitch();

        if (!this.storage.lastUsageVersion && !this.storage.backgroundStreamQuery) {
            console.log('[backgrounds] Not set stream query. Set default...');
            this.core.storageService.updatePersistent({
                backgroundStreamQuery: {
                    type: 'collection',
                    id: 'EDITORS_CHOICE',
                },
            });
        }
    }
}

export default BackgroundsServerService;
