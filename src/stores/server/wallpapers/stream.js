import { action, makeAutoObservable, toJS } from 'mobx';
import { captureException } from '@sentry/browser';
import { first } from 'lodash';
import consoleBinder from '@/utils/console/bind';
import WallpapersUniversalService from '@/stores/universal/wallpapers/service';
import Wallpaper from '@/stores/universal/wallpapers/entities/wallpaper';
import api from '@/utils/helpers/api';
import appVariables from '@/config/config';
import { BG_SOURCE, BG_TYPE } from '@/enum';

const bindConsole = consoleBinder('wallpapers-stream');

class StreamWallpapersService {
    core;
    storage;
    settings;
    _fetchCount = 0;
    _isSearching = false;
    _isPreparing = false;

    constructor(core) {
        makeAutoObservable(this);
        this.core = core;
        this.storage = this.core.storage;
        this.settings = this.core.settingsService.wallpapers;
    }

    @action
    async _setFromQueue() {
        bindConsole.log('Set wallpaper from queue...');

        if (this.core.isOffline && !first(this.storage.data.wallpapersStreamQueue)?.isLoad) {
            bindConsole.log('App is offline and next wallpaper not prefetch. Get background from local store...');
            this._fetchCount = 0;

            return this.core.wallpapersService.local.next();
        }

        let nextWallpaper;

        if (!first(this.storage.data.wallpapersStreamQueue).isLoad) {
            try {
                const { url, previewUrl } = await WallpapersUniversalService.fetch(
                    first(this.storage.data.wallpapersStreamQueue),
                    { cacheTime: 'temp' },
                );

                nextWallpaper = new Wallpaper({
                    ...first(this.storage.data.wallpapersStreamQueue),
                    fullSrc: url,
                    previewSrc: previewUrl,
                    isLoad: true,
                });
            } catch (e) {
                bindConsole.error('Failed prefetch wallpaper. Get next...', e);
                captureException(e);

                this.storage.update({ wallpapersStreamQueue: this.storage.data.wallpapersStreamQueue.splice(1) });

                return this.next();
            }
        }

        nextWallpaper = nextWallpaper || new Wallpaper({
            ...first(this.storage.data.wallpapersStreamQueue),
            isLoad: true,
        });

        this.storage.update({ wallpapersStreamQueue: this.storage.data.wallpapersStreamQueue.splice(1) });

        this._fetchCount = 0;

        if (nextWallpaper.id === this.storage.data.bgCurrent?.id) {
            bindConsole.warn('Select same wallpaper. Try next...');

            return this.next();
        }

        await this.core.wallpapersService.set(nextWallpaper);

        return this._prepareNextInQueue();
    }

    async _prepareNextInQueue() {
        if (this._isPreparing) {
            bindConsole.log('Already preparing queue. Skip...');
            return Promise.resolve();
        }

        bindConsole.log('Prepare queue...');

        this._isPreparing = true;

        if (this.storage.data.wallpapersStreamQueue.length === 0) {
            bindConsole.log('Backgrounds is over, preload new...');

            await this._preloadQueue();
        }

        const nextPrepareIndex = this.storage.data.wallpapersStreamQueue.findIndex(({ isLoad }) => !isLoad);

        bindConsole.log(`Prefetch wallpapers. ${
            nextPrepareIndex + 1
        } of ${
            this.storage.data.wallpapersStreamQueue.length
        }...`);

        if (this.core.isOffline) {
            bindConsole.warn('App is offline. Impossible prefetch bg. Abort...');

            return Promise.resolve();
        }

        if (
            nextPrepareIndex + 1 > appVariables.wallpapers.stream.prefetchCount
            || nextPrepareIndex > this.storage.data.wallpapersStreamQueue.length - 1
            || nextPrepareIndex === -1
        ) {
            bindConsole.log('Prefetch enough wallpapers. Stopping');

            if (this.storage.data.wallpapersStreamQueue.length < appVariables.wallpapers.stream.prefetchCount) {
                bindConsole.log('Backgrounds are almost over, preload new ones...');

                return this._preloadQueue();
            } else {
                return Promise.resolve();
            }
        }

        const nextPrepare = this.storage.data.wallpapersStreamQueue[nextPrepareIndex];

        try {
            const { url, previewUrl } = await WallpapersUniversalService.fetch(nextPrepare, { cacheTime: 'temp' });

            this.storage.update({
                wallpapersStreamQueue: this.storage.data.wallpapersStreamQueue.map((bg) => {
                    if (bg.id !== nextPrepare.id) return bg;

                    return {
                        ...bg,
                        fullSrc: url,
                        previewSrc: previewUrl,
                        isLoad: true,
                    };
                }),
            });
        } catch (e) {
            bindConsole.error('Failed prefetch wallpaper. Remove from queue and fetch next...', e);
            captureException(e);

            this.storage.update({ wallpapersStreamQueue: this.storage.data.wallpapersStreamQueue.splice(nextPrepareIndex, 1) });

            this._isPreparing = false;
            return this._prepareNextInQueue();
        }

        if (
            nextPrepareIndex < appVariables.wallpapers.stream.prefetchCount
            && nextPrepareIndex < this.storage.data.wallpapersStreamQueue.length - 1
        ) {
            this._isPreparing = false;
            return this._prepareNextInQueue();
        } else {
            bindConsole.log('Prefetch enough wallpapers. Stopping');
            if (this.storage.data.wallpapersStreamQueue.length < appVariables.wallpapers.stream.prefetchCount) {
                bindConsole.log('Backgrounds are almost over, preload new ones...');
                return this._preloadQueue();
            } else {
                return Promise.resolve();
            }
        }
    }

    @action
    async _preloadQueue() {
        bindConsole.log('Preload queue...');

        if (this.storage.data.wallpapersStreamQuery?.type === 'saved-only') {
            return Promise.resolve();
        }

        const type = this.settings.type.join(',').toLowerCase();

        try {
            let path;
            let query;

            if (this.storage.data.wallpapersStreamQuery?.type === 'collection') {
                path = `wallpapers/collection/${this.storage.data.wallpapersStreamQuery?.value}`;
                query = {
                    type,
                    count: appVariables.wallpapers.stream.preloadMetaCount,
                };
            } else {
                path = 'wallpapers/random';
                query = {
                    type,
                    query: this.storage.data.wallpapersStreamQuery?.value || '',
                    count: appVariables.wallpapers.stream.preloadMetaCount,
                };
            }

            const { response, statusCode } = await api.get(path, { query });

            if (statusCode !== 200) {
                bindConsole.error('Failed preload queue', response);

                return Promise.reject(new Error('Failed request'));
            }

            if (response.length === 0) {
                bindConsole.error('Failed preload queue. Response empty');

                return Promise.reject(new Error('No results'));
            }

            this._fetchCount = 0;
            this.storage.update({
                wallpapersStreamQueue: [
                    ...(this.storage.data.wallpapersStreamQueue || []),
                    ...response.map((bg) => new Wallpaper({
                        ...bg,
                        kind: 'media',
                        // contrastColor: bg.color,
                        idInSource: bg.idInSource,
                        source: BG_SOURCE[bg.source.toUpperCase()],
                        type: BG_TYPE[bg.type.toUpperCase()],
                        fullSrc: bg.fullSrc,
                        previewSrc: bg.previewSrc,
                    })),
                ],
            });

            return Promise.resolve();
        } catch (e) {
            captureException(e);

            return Promise.reject(e);
        }
    }

    @action
    async next() {
        bindConsole.log('Search next wallpaper from stream station...');

        if (!this.storage.data.wallpapersStreamQuery) {
            bindConsole.log('Not set stream query. Set default...');

            this.storage.update({
                wallpapersStreamQuery: {
                    type: 'collection',
                    value: 'editors-choice',
                },
            });
        }

        if (this.storage.data.wallpapersStreamQuery?.type === 'saved-only') {
            this._fetchCount = 0;

            return this.core.wallpapersService.local.next();
        }

        if (Math.random() > 0.8) {
            const localWallpaper = await this.core.wallpapersService.local.getRandom([BG_SOURCE.USER]);

            if (localWallpaper) {
                bindConsole.log('Set user upload wallpaper...');

                return this.core.wallpapersService.set(localWallpaper);
            }
        }

        this._fetchCount += 1;

        if (this._fetchCount > 6) {
            bindConsole.log('Many failed requests. Get background from local store...');

            return this.core.wallpapersService.local.next();
        }

        if (this._fetchCount > 2) {
            const timeout = Math.min(this._fetchCount * 1000, 30000);
            bindConsole.log(`Many failed requests. Wait ${timeout}ms`);

            await new Promise((resolve) => setTimeout(resolve, timeout));
        }

        if (this.storage.data.wallpapersStreamQueue?.length > 0) {
            return this._setFromQueue();
        }

        if (this.core.isOffline) {
            bindConsole.log('App is offline. Get background from local store...');
            this._fetchCount = 0;

            return this.core.wallpapersService.local.next();
        }

        try {
            bindConsole.log('Empty query. Load...');
            await this._preloadQueue();

            return this._setFromQueue();
        } catch (e) {
            bindConsole.error('Failed get wallpapers from stream. Get from local', e);
            captureException(e);

            return this.core.wallpapersService.local.next();
        }
    }
}

export default StreamWallpapersService;
