import { reaction, toJS } from 'mobx';
import { first } from 'lodash';
import { captureException } from '@sentry/browser';
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
import Wallpaper from '@/stores/universal/wallpapers/entities/wallpaper';
import db from '@/utils/db';
import appVariables from '@/config/appVariables';
import fetchData from '@/utils/helpers/fetchData';
import WallpapersUniversalService, { ERRORS } from '@/stores/universal/wallpapers/service';
import { eventToApp } from '@/stores/universal/serviceBus';
import api from '@/utils/helpers/api';
import consoleBinder from '@/utils/console/bind';

const bindConsole = consoleBinder('wallpapers');

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
        this.core = core;
        this.storage = this.core.storage.persistent;
        this.settings = this.core.settingsService.backgrounds;

        this.subscribe();
    }

    /* async _runScheduler() {
        if (this.settings.changeInterval === BG_CHANGE_INTERVAL.OPEN_TAB) return;

        try {
            console.log('[wallpapers] Update next run scheduler timestamp...');
            const bgNextSwitchTimestamp = Date.now() + BG_CHANGE_INTERVAL_MILLISECONDS[this.settings.changeInterval];

            this.storage.update({ bgNextSwitchTimestamp });
            await this._schedulerSwitch();
        } catch (e) {
            console.error('[wallpapers] Failed change interval', e);
            captureException(e);
        }
    }

    async _schedulerSwitch() {
        if (this.settings.changeInterval === BG_CHANGE_INTERVAL.OPEN_TAB) return Promise.resolve();

        console.log('[wallpapers] Call scheduler switch');
        if (!this.storage.data?.bgNextSwitchTimestamp || this.storage.data.bgNextSwitchTimestamp <= Date.now()) {
            console.log('[wallpapers] Run switch scheduler...');
            await this.nextBG();
            return Promise.resolve();
        }

        clearTimeout(this._schedulerTimer);
        this._schedulerTimer = setTimeout(
            () => this._schedulerSwitch(),
            this.storage.data.bgNextSwitchTimestamp - Date.now(),
        );
        console.log(`[wallpapers] Set scheduler switch. Run after ${
            this.storage.data.bgNextSwitchTimestamp - Date.now()
        }ms`);
        return Promise.resolve();
    }

    nextBG() {
        console.log(`[wallpapers] Next background request. Selection method: ${this.settings.selectionMethod}`);
        if (this.bgState === BG_SHOW_STATE.SEARCH) {
            console.log('[wallpapers] Wallpaper already searching. Skip...');
            return Promise.resolve();
        }
        if (this.settings.selectionMethod === BG_SELECT_MODE.SPECIFIC) {
            console.log(`[wallpapers] Selection method ${this.settings.selectionMethod} not support. Abort...`);
            return Promise.resolve();
        }

        eventToApp('wallpapers/state', BG_SHOW_STATE.SEARCH);

        if (this.settings.selectionMethod === BG_SELECT_MODE.RANDOM) {
            return this.nextBGLocal();
        } else if (this.settings.selectionMethod === BG_SELECT_MODE.STREAM) {
            return this.nextBGStream();
        }

        return Promise.resolve();
    }

    async nextBGLocal() {
        console.log('[wallpapers] Search next background from local library...');
        this.bgState = BG_SHOW_STATE.SEARCH;
        const bgs = (await Promise.all(this.settings.type.map((type) => (
            db().getAllFromIndex('wallpapers', 'type', type)
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

    async _prepareQueue(fetchIndex = 0) {
        if (this.storage.data.bgsStream.length === 0) {
            console.log('[wallpapers] Backgrounds is over, preload new ones...');
            return this._preloadQueue();
        }
        console.log(`[wallpapers] Prefetch wallpapers. Now ${
            fetchIndex + 1
        } from ${
            this.storage.data.bgsStream.length
        }...`);

        if (this.core.isOffline) {
            console.log('[wallpapers] App is offline. Impossible prefetch bg. Abort...');
            return Promise.resolve();
        }

        const currBg = this.storage.data.bgsStream[fetchIndex];
        let fileName;

        if (
            fetchIndex + 1 <= appVariables.wallpapers.stream.prefetchCount
            && fetchIndex <= this.storage.data.bgsStream.length - 1
        ) {
            if (currBg.state === FETCH.PENDING || currBg.state === FETCH.DONE) {
                console.log('[wallpapers] Backgrounds already fetch or fetching. Skip...');
                return this._prepareQueue(fetchIndex + 1);
            }
        } else {
            console.log('[wallpapers] Prefetch enough wallpapers. Stopping');

            if (this.storage.data.bgsStream.length < appVariables.wallpapers.stream.prefetchCount) {
                console.log('[wallpapers] Backgrounds are almost over, preload new ones...');
                return this._preloadQueue();
            } else {
                return Promise.resolve();
            }
        }

        this.storage.update({
            bgsStream: this.storage.data.bgsStream.map((bg) => {
                if (bg.downloadLink !== currBg.downloadLink) return bg;

                return {
                    ...bg,
                    state: FETCH.PENDING,
                };
            }),
        });

        try {
            fileName = await WallpapersUniversalService.fetch(currBg, { preview: false });
        } catch (e) {
            console.error('[wallpapers] Failed get background. Remove from queue and fetch next...', e);
            captureException(e);

            this.storage.update({ bgsStream: this.storage.data.bgsStream.splice(fetchIndex, 1) });

            return this._prepareQueue(fetchIndex);
        }

        this.storage.update({
            bgsStream: this.storage.data.bgsStream.map((bg) => {
                if (bg.downloadLink !== currBg.downloadLink) return bg;

                return {
                    ...bg,
                    fileName,
                    state: FETCH.DONE,
                };
            }),
        });

        if (
            fetchIndex < appVariables.wallpapers.stream.prefetchCount
            && fetchIndex < this.storage.data.bgsStream.length - 1
        ) {
            return this._prepareQueue(fetchIndex + 1);
        } else {
            console.log('[wallpapers] Prefetch enough wallpapers. Stopping');
            if (this.storage.data.bgsStream.length < appVariables.wallpapers.stream.prefetchCount) {
                console.log('[wallpapers] Backgrounds are almost over, preload new ones...');
                return this._preloadQueue();
            } else {
                return Promise.resolve();
            }
        }
    }

    async _setFromQueue() {
        let fileName;

        if (this.core.isOffline && !first(this.storage.data.bgsStream)?.fileName) {
            console.log('[wallpapers] App is offline and next bg not prefetch. Get background from local store...');
            this._fetchCount = 0;
            return this.nextBGLocal();
        }

        if (first(this.storage.data.bgsStream).fileName) {
            fileName = first(this.storage.data.bgsStream).fileName;
        } else {
            try {
                fileName = await WallpapersUniversalService.fetch(
                    first(this.storage.data.bgsStream),
                    { preview: false },
                );
            } catch (e) {
                console.error('[wallpapers] Failed get background. Get next...', e);
                captureException(e);

                this.storage.update({ bgsStream: this.storage.data.bgsStream.splice(1) });

                return this.nextBGStream();
            }
        }

        const currBg = new Wallpaper({
            ...first(this.storage.data.bgsStream),
            fileName,
            isLoad: true,
        });

        this.storage.update({
            bgsStream: this.storage.data.bgsStream.splice(1),
            currentBGStream: currBg,
        });

        this._fetchCount = 0;
        await this.setBG(new Wallpaper(currBg));
        return this._prepareQueue();
    }

    async _preloadQueue(force = false) {
        if (!force && this._queueIsPreloaded) {
            console.log('[wallpapers] Queue already preload. Abort...');
            return Promise.resolve();
        }

        if (!force) this._queueIsPreloaded = true;
        console.log(`[wallpapers] Preload queue... Is force: ${force}`);
        const place = this.storage.data.wallpapersStreamQuery?.type === 'collection'
            ? 'collection'
            : 'random';

        const type = this.settings.type.join(',').toLowerCase();

        try {
            const { response } = await api.get(`wallpapers/${place}`, {
                query: {
                    type,
                    query: this.storage.data.wallpapersStreamQuery?.value || '',
                    count: appVariables.wallpapers.stream.preloadMetaCount,
                },
            });

            if (response.length === 0) {
                console.log('[wallpapers] Response empty');

                if (!force) this._queueIsPreloaded = false;
                return Promise.reject(new Error('No results'));
            }

            this._fetchCount = 0;
            this.storage.update({
                bgsStream: [
                    ...(this.storage.data.bgsStream || []),
                    ...response.map((bg) => new Wallpaper({
                        ...bg,
                        idInSource: bg.idInSource,
                        source: BG_SOURCE[bg.source.toUpperCase()],
                        type: BG_TYPE[bg.type],
                        downloadLink: bg.fullSrc,
                        previewLink: bg.previewSrc,
                    })),
                ],
            });
            if (!force) this._queueIsPreloaded = false;
            return Promise.resolve();
        } catch (e) {
            captureException(e);
            if (!force) this._queueIsPreloaded = false;
            return Promise.reject(e);
        }
    }

    async nextBGStream() {
        if (this.prepareBgState === BG_SHOW_STATE.SEARCH) {
            console.log('[wallpapers] Load prepare background. Wait...');
            this.bgState = BG_SHOW_STATE.SEARCH;

            return Promise.resolve();
        }

        console.log('[wallpapers] Search next background from stream station...');
        if (!this.storage.data.wallpapersStreamQuery) {
            console.log('[wallpapers] Not set stream query. Set default...');
            this.storage.update({
                wallpapersStreamQuery: {
                    type: 'collection',
                    id: 'EDITORS_CHOICE',
                },
            });
        }
        this.bgState = BG_SHOW_STATE.SEARCH;
        this._fetchCount += 1;

        if (this._fetchCount > 4) {
            const timeout = Math.min(this._fetchCount * 1000, 30000);
            console.log(`[wallpapers] Many failed requests, wait ${timeout}ms`);
            await new Promise((resolve) => setTimeout(resolve, timeout));
        }

        if (this.storage.data.bgsStream?.length > 0) {
            return this._setFromQueue();
        }

        if (this.core.isOffline) {
            console.log('[wallpapers] App is offline. Get background from local store...');
            this._fetchCount = 0;
            return this.nextBGLocal();
        }

        try {
            await this._preloadQueue(true);

            return this._setFromQueue();
        } catch (e) {
            console.log('[wallpapers] Failed get wallpapers', e);
            captureException(e);
            return this.nextBGLocal();
        }
    }

    async setBG(setBG) {
        console.log('[wallpapers] Set background', setBG);

        if (setBG && !setBG.fullSrc) {
            console.log('[wallpapers] Bg not load background. Fetch...');
            let urls;

            try {
                urls = await WallpapersUniversalService.fetch(setBG, { preview: false });
            } catch (e) {
                console.error('[wallpapers] Failed get background. Get next...', e);
                captureException(e);

                return Promise.reject(e);
            }

            return this.setBG(new Wallpaper({
                ...setBG,
                ...urls,
                isLoad: true,
            }));
        }

        if (this.currentBGId === setBG?.id) {
            this.bgState = BG_SHOW_STATE.DONE;
            eventToApp('wallpapers/state', BG_SHOW_STATE.DONE);
            return Promise.resolve();
        }

        if (!setBG) {
            console.log('Error set bg');
            this._currentBG = null;
            this.currentBGId = null;

            this.storage.update({ bgCurrent: null });

            this.bgState = BG_SHOW_STATE.NOT_FOUND;
            eventToApp('wallpapers/state', BG_SHOW_STATE.NOT_FOUND);

            return Promise.resolve();
        }

        if (this.bgShowMode === BG_SHOW_MODE.STATIC) setBG.pauseTimestamp = -0.5;

        const isSaved = (await db().count('wallpapers', setBG.id)) !== 0;

        this._currentBG = setBG;
        this.currentBGId = this._currentBG.id;

        this.storage.update({
            bgCurrent: {
                ...setBG,
                isSaved,
                isLiked: isSaved,
            },
        });

        this.bgState = BG_SHOW_STATE.DONE;
        eventToApp('wallpapers/state', BG_SHOW_STATE.DONE);

        return Promise.resolve();
    }

    play() {
        this._currentBG.pause = false;
        this.bgShowMode = BG_SHOW_MODE.LIVE;

        this.storage.update({
            bgCurrent: new Wallpaper({
                ...this._currentBG,
                pauseTimestamp: null,
                pauseStubSrc: null,
            }),
            bgShowMode: BG_SHOW_MODE.LIVE,
        });

        return Promise.resolve();
    }

    async pause({ bgId, frameURL, timestamp }) {
        console.log('pause bg:', this.currentBGId, bgId);
        if (bgId !== this.currentBGId) return Promise.reject(new Error(ERRORS.ID_BG_IS_CHANGED));

        const { response: frameBlob } = await fetchData(frameURL, { responseType: 'blob' });
        const cache = await caches.open('wallpapers');

        const frameResponse = new Response(frameBlob);
        let frameUrl;

        if (this._currentBG.source === BG_SOURCE.USER) {
            frameUrl = `${appVariables.rest.url}/background/user/get-frame?id=${this._currentBG.id}&timestamp=${timestamp}`;
        } else {
            frameUrl = `${appVariables.rest.url}/background/get-frame?src=${encodeURIComponent(this._currentBG.downloadLink)}&timestamp=${timestamp}`;
        }
        await cache.put(frameUrl, frameResponse);

        this._currentBG.pauseTimestamp = timestamp;
        this._currentBG.pauseStubSrc = frameUrl;
        this.bgShowMode = BG_SHOW_MODE.STATIC;

        this.storage.update({
            bgCurrent: this._currentBG,
            bgShowMode: BG_SHOW_MODE.STATIC,
        });
        console.log('Set bgShowMode:', this.bgShowMode);

        return Promise.resolve();
    }

    cacheBackgrounds(urls) {
        caches.open('wallpapers')
            .then((cache) => {
                console.log('cache:', cache, urls);

                const response = new Response(urls[0]);

                return cache.put(`${appVariables.rest.url}/bg1`, response);
            });
    } */

    _changeMood() {
        bindConsole.log(
            'Change mood',
            {
                type: this.settings.type,
                selectionMethod: this.settings.selectionMethod,
                streamQuery: this.storage.data.wallpapersStreamQuery,
            },
        );
    }

    subscribe() {
        /* try {
            if (this.storage.data.lastUsageVersion) {
                if (
                    this.storage.data.bgNextSwitchTimestamp > Date.now()
                    || this.settings.selectionMethod === BG_SELECT_MODE.SPECIFIC
                ) {
                    console.log('[wallpapers] Restore current background...');
                    this.bgState = BG_SHOW_STATE.DONE;

                    const bg = new Wallpaper(this.storage.data.bgCurrent);

                    this._currentBG = bg;
                    this.bgShowMode = bg.pause ? BG_SHOW_MODE.STATIC : BG_SHOW_MODE.LIVE;
                    this.currentBGId = this._currentBG.id;
                } else {
                    console.log('[wallpapers] Current background is expired. Change to next...');
                    this.nextBG();
                }
            }
        } catch (e) {
            console.error('[wallpapers] Error check current background. Change to next...', e);
            captureException(e);
            this.nextBG();
        }

        this.core.globalEventBus.on('wallpapers/nextBg', () => this.nextBG());

        this.core.globalEventBus.on('wallpapers/setBg', ({ data: bg, callback }) => {
            this.setBG(bg).finally(callback);
        });

        this.core.globalEventBus.on('wallpapers/play', async ({ callback }) => {
            console.log('wallpapers/play');
            try {
                await this.play();
                callback({ success: true });
            } catch (e) {
                callback({
                    success: false,
                    error: e,
                });
                console.log(e);
                captureException(e);
            }
        });

        this.core.globalEventBus.on('wallpapers/pause', async ({ data, callback }) => {
            console.log('wallpapers/pause', data);
            try {
                await this.pause(data);
                callback({ success: true });
            } catch (e) {
                callback({
                    success: false,
                    error: e,
                });
                captureException(e);
            }
        });

        this.core.globalEventBus.on('wallpapers/cache', async ({ data: urls }) => {
            console.log('wallpapers/cache', urls);
            this.cacheBackgrounds(urls);
        });

        reaction(
            () => this.storage.data.bgCurrent?.id,
            () => {
                console.log(
                    '[wallpapers] Run scheduler. Reason \'change bg\'. New bg:',
                    toJS(this.storage.data.bgCurrent),
                );
                this._runScheduler();
            },
        );

        reaction(
            () => first(this.storage.data.bgsStream)?.state,
            () => {
                const bg = first(this.storage.data.bgsStream);

                if (!bg) return;

                if (bg.state === FETCH.PENDING) {
                    this.prepareBgState = BG_SHOW_STATE.SEARCH;
                } else if (bg.state === FETCH.DONE) {
                    this.prepareBgState = BG_SHOW_STATE.DONE;
                    if (this.bgState === BG_SHOW_STATE.SEARCH) {
                        console.log('[wallpapers] Search next background. Reload worker...');
                        this.nextBGStream()
                            .catch((e) => {
                                console.error(e);
                                captureException(e);
                            });
                    }
                } else {
                    this.prepareBgState = BG_SHOW_STATE.WAIT;
                }
            },
        );

        if (
            !this.storage.data.lastUsageVersion
            && this.settings.selectionMethod === BG_SELECT_MODE.STREAM
            && !this.storage.data.wallpapersStreamQuery
        ) {
            console.log('[wallpapers] Not set stream query. Set default...');
            this.storage.update({
                wallpapersStreamQuery: {
                    type: 'collection',
                    id: 'EDITORS_CHOICE',
                },
            });
        } */

        reaction(
            () => JSON.stringify(this.settings.selectionMethod),
            () => {
                bindConsole.log(
                    'Change \'selectionMethod\'. New selection method:',
                    toJS(this.settings.selectionMethod),
                );

                this._changeMood();
            },
        );

        reaction(
            () => JSON.stringify(this.settings.type),
            () => {
                bindConsole.log('Change \'type\'. New type:', toJS(this.settings.type));

                this._changeMood();
            },
        );

        reaction(
            () => this.settings.changeInterval,
            () => {
                bindConsole.log(
                    'Run scheduler. Reason \'change interval\'. New interval:',
                    this.settings.changeInterval,
                );
                // this._runScheduler();
            },
        );

        reaction(
            () => `${this.storage.data.wallpapersStreamQuery?.type}${this.storage.data.wallpapersStreamQuery?.value}`,
            () => {
                // if (!this.storage.data.wallpapersStreamQuery) return;
                bindConsole.log(
                    'Change stream query. Reload worker... New query:',
                    toJS(this.storage.data.wallpapersStreamQuery),
                );
                /* this.nextBGStream()
                    .catch((e) => {
                        console.error(e);
                        captureException(e);
                    }); */

                this._changeMood();
            },
        );

        /* if (this.settings.changeInterval && this.storage.data.lastUsageVersion) this._schedulerSwitch(); */
    }
}

export default BackgroundsServerService;
