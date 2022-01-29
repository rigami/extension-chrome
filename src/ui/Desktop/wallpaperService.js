import { captureException } from '@sentry/react';
import {
    makeAutoObservable, reaction, toJS, computed, action,
} from 'mobx';
import { BG_SHOW_MODE, BG_TYPE, FETCH } from '@/enum';
import { eventToBackground } from '@/stores/universal/serviceBus';
import BackgroundEntity from '@/stores/universal/wallpapers/entities/wallpaper';
import consoleBinder from '@/utils/console/bind';

const bindConsole = consoleBinder('wallpapers');

class WallpaperService {
    currentBg = null;
    requestedBg = null;
    stateLoadBg = FETCH.PENDING;
    stateLoadRequestedBg = FETCH.WAIT;
    settings;
    storage;
    _listeners = [];
    _coreService;
    _nextWallpaper;
    _stateNextWallpaper = FETCH.WAIT;
    _currentWallpaper;
    _contrastColor;

    constructor({ coreService, wallpapersSettings }) {
        makeAutoObservable(this);
        this._coreService = coreService;
        this.settings = wallpapersSettings;
        this.storage = coreService.storage.persistent;

        this.subscribe();
    }

    async generatePreview(video) {
        console.log('Generate preview...');
        const drawElement = video;
        const drawWidth = video.videoWidth;
        const drawHeight = video.videoHeight;

        const canvas = new OffscreenCanvas(drawWidth, drawHeight);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(drawElement, 0, 0);

        const fullBlob = await canvas.convertToBlob({
            type: 'image/jpeg',
            quality: 1,
        });

        return URL.createObjectURL(fullBlob);
    }

    @computed
    get state() {
        return this.storage.data.wallpaperState;
    }

    @computed
    get current() {
        return this._currentWallpaper;
    }

    @computed
    get contrastColor() {
        return this._contrastColor;
    }

    @action
    setContrastColor(color) {
        this._contrastColor = color;
    }

    _switchTo(wallpaper) {
        bindConsole.log('Switch current wallpaper to next wallpaper...');

        this._currentWallpaper = wallpaper;
    }

    _loadNext(wallpaper) {
        bindConsole.log('Load next wallpaper...');

        if (this._nextWallpaper) {
            bindConsole.log('Cancel previous next wallpaper');
        }

        if (wallpaper.kind === 'color') {
            this._switchTo(wallpaper);

            return;
        }

        this._nextWallpaper = wallpaper;
        this._stateNextWallpaper = FETCH.PENDING;

        const successLoad = () => {
            if (this._nextWallpaper?.id !== wallpaper.id) return;

            bindConsole.log('Next wallpaper ready');
            this._stateNextWallpaper = FETCH.DONE;

            this._switchTo(wallpaper);
        };

        const failedLoad = (e) => {
            if (this._nextWallpaper?.id !== wallpaper.id) return;

            bindConsole.error('Failed load next wallpaper', e);
            this._stateNextWallpaper = FETCH.FAILED;

            this._switchTo(null);
        };

        if (wallpaper.type === BG_TYPE.VIDEO) {
            const video = document.createElement('video');

            video.onloadedmetadata = successLoad;
            video.onerror = failedLoad;

            video.src = wallpaper.fullSrc;
        } else {
            const image = new Image();

            image.onload = successLoad;
            image.onerror = failedLoad;

            image.src = wallpaper.fullSrc;
        }
    }

    subscribe() {
        /* this._listeners = [
            this._coreService.localEventBus.on('background/pause', () => {
                bgRef.current.onpause = async (event) => {
                    const video = event.target;
                    const pauseTimestamp = bgRef.current.currentTime;
                    const captureBGId = store.currentBg.id;

                    try {
                        const frameURL = await service.generatePreview(video);

                        await new Promise((resolve, reject) => eventToBackground('wallpapers/pause', {
                            bgId: captureBGId,
                            frameURL,
                            timestamp: pauseTimestamp,
                        }, (data) => {
                            console.log('wallpapers/pause', data);
                            if (data.success) {
                                resolve();
                            } else {
                                reject(new Error(`Failed pause (${JSON.stringify(data)})`));
                            }
                        }));
                    } catch (e) {
                        captureException(e);
                        console.log('Failed pause', e);
                        return;
                    }

                    store.captureFrameTimer = setTimeout(() => {
                        console.log(store.currentBg.id, wallpapers.currentBGId, wallpapers.bgShowMode);
                        if (
                            !store.currentBg
                            || store.currentBg.id !== wallpapers.currentBGId
                            || wallpapers.bgShowMode !== BG_SHOW_MODE.STATIC
                            || pauseTimestamp !== bgRef.current.currentTime
                        ) {
                            return;
                        }

                        store.requestBg = wallpapers.currentBG;
                    }, 5000);
                };

                bgRef.current.play().then(() => bgRef.current.pause());
            }),
            this._coreService.localEventBus.on('background/play', async () => {
                console.log('wallpapers/play');
                if (typeof store.captureFrameTimer === 'number') clearTimeout(+store.captureFrameTimer);
                store.captureFrameTimer = null;

                try {
                    await new Promise((resolve, reject) => eventToBackground('wallpapers/play', {}, (data) => {
                        console.log('background/play callback:', data);
                        if (data.success) {
                            resolve();
                        } else {
                            reject(new Error(JSON.stringify(data)));
                        }
                    }));
                } catch (e) {
                    console.log(e);
                    captureException(e);
                    return;
                }

                if (bgRef.current.play) {
                    console.log('play background...');
                    bgRef.current.play();
                    bgRef.current.onpause = null;
                } else {
                    const currBG = wallpapers.currentBG;

                    store.requestBg = new BackgroundEntity({
                        ...currBG,
                        pauseTimestamp: null,
                        pauseStubSrc: null,
                    });
                }
            }),
        ]; */

        reaction(
            () => this.storage.data.bgCurrent?.id,
            () => {
                bindConsole.log('Change \'wallpaper\'. New:', toJS(this.storage.data.bgCurrent));

                this._loadNext(this.storage.data.bgCurrent);
            },
        );

        reaction(
            () => this.storage.data.bgCurrent,
            () => {
                bindConsole.log('Change \'wallpaper\' props. New:', toJS(this.storage.data.bgCurrent));

                if (this.current?.id === this.storage.data.bgCurrent?.id) {
                    this._currentWallpaper = this.storage.data.bgCurrent;
                }
            },
        );

        console.log('this.storage.data:', this.storage.data);

        if (this.storage.data.bgCurrent) this._loadNext(this.storage.data.bgCurrent);
    }

    unsubscribe() {
        this._listeners.forEach((listenerId) => this._coreService.localEventBus.removeListener(listenerId));
    }
}

export default WallpaperService;
