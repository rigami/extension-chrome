import {
    action, makeAutoObservable, reaction, runInAction, toJS,
} from 'mobx';
import { captureException } from '@sentry/browser';
import { assign } from 'lodash';
import StreamWallpapersService from '@/stores/server/wallpapers/stream';
import consoleBinder from '@/utils/console/bind';
import {
    BG_CHANGE_INTERVAL,
    BG_CHANGE_INTERVAL_MILLISECONDS, BG_RATE,
    BG_SELECT_MODE,
    BG_SHOW_STATE,
} from '@/enum';
import WallpapersUniversalService from '@/stores/universal/wallpapers/service';
import Wallpaper from '@/stores/universal/wallpapers/entities/wallpaper';
import db from '@/utils/db';
import LocalWallpapersService from '@/stores/server/wallpapers/local';
import ColorWallpapersService from '@/stores/server/wallpapers/color';
import api from '@/utils/helpers/api';

const bindConsole = consoleBinder('wallpapers');

class WallpapersService {
    stream;
    local;
    color;
    storage;
    settings;
    _schedulerTimer;

    constructor(core) {
        makeAutoObservable(this);
        this.core = core;
        this.storage = this.core.storage;
        this.settings = this.core.settingsService.wallpapers;

        this.subscribe();
    }

    @action
    async _changeMood() {
        bindConsole.log(
            'Change mood',
            {
                type: this.settings.type,
                kind: this.settings.kind,
                streamQuery: this.storage.data.wallpapersStreamQuery,
            },
        );

        runInAction(() => {
            this.storage.update({ wallpapersStreamQueue: [] });
        });

        await this.next();
    }

    async _reCalcScheduler() {
        if (
            this.settings.changeInterval === BG_CHANGE_INTERVAL.OPEN_TAB
            || this.settings.changeInterval === BG_CHANGE_INTERVAL.NEVER
        ) return;

        try {
            const bgNextSwitchTimestamp = Date.now() + BG_CHANGE_INTERVAL_MILLISECONDS[this.settings.changeInterval];
            bindConsole.log(`Update next run scheduler of ${new Date(bgNextSwitchTimestamp).toString()}`);

            this.storage.update({ bgNextSwitchTimestamp });
            await this._startScheduler();
        } catch (e) {
            bindConsole.error('Failed change interval', e);
            captureException(e);
        }
    }

    async _startScheduler() {
        if (
            this.settings.changeInterval === BG_CHANGE_INTERVAL.OPEN_TAB
            || this.settings.changeInterval === BG_CHANGE_INTERVAL.NEVER
        ) return Promise.resolve();

        if (!this.storage.data?.bgNextSwitchTimestamp || this.storage.data.bgNextSwitchTimestamp <= Date.now()) {
            bindConsole.log('Run next by scheduler...');
            await this.next();
            return Promise.resolve();
        }

        if (this._schedulerTimer) clearTimeout(this._schedulerTimer);
        this._schedulerTimer = setTimeout(
            () => this._startScheduler(),
            this.storage.data.bgNextSwitchTimestamp - Date.now(),
        );
        bindConsole.log(`Set scheduler. Run after ${this.storage.data.bgNextSwitchTimestamp - Date.now()}ms`);
        return Promise.resolve();
    }

    async next() {
        bindConsole.log(`Next wallpaper request. Selection method: ${this.settings.kind}`);

        if (this.storage.wallpaperState === BG_SHOW_STATE.SEARCH) {
            bindConsole.log('Already searching. Skip next request...');
            return Promise.resolve();
        }

        if (this.settings.kind === BG_SELECT_MODE.STREAM) {
            this.storage.update({ wallpaperState: BG_SHOW_STATE.SEARCH });

            return this.stream.next();
        }

        if (this.settings.kind === BG_SELECT_MODE.COLOR) {
            this.storage.update({ wallpaperState: BG_SHOW_STATE.SEARCH });

            return this.color.next();
        }

        bindConsole.log(
            `Request next wallpaper not support for ${this.settings.kind} selection method. Abort...`,
        );

        return Promise.resolve();
    }

    async rate(wallpaperId, rate) {
        bindConsole.log('Rate wallpaper:', rate, wallpaperId);

        const prevState = {
            isLiked: this.storage.data.bgCurrent.isLiked,
            isDisliked: this.storage.data.bgCurrent.isDisliked,
        };

        this.storage.update({
            bgCurrent: {
                ...this.storage.data.bgCurrent,
                isLiked: rate === BG_RATE.LIKE,
                isDisliked: rate === BG_RATE.DISLIKE,
            },
        });

        const { ok } = await api.post(`wallpapers/${wallpaperId}/${rate?.toLowerCase() || 'reset-rate'}`);

        if (!ok) {
            this.storage.update({
                bgCurrent: {
                    ...this.storage.data.bgCurrent,
                    ...prevState,
                },
            });
        }
    }

    async set(wallpaper) {
        bindConsole.log('Set wallpaper:', wallpaper);

        if (wallpaper && wallpaper.kind === 'color') {
            this.storage.update({
                bgCurrent: {
                    ...wallpaper,
                    isSaved: true,
                },
                wallpaperState: BG_SHOW_STATE.DONE,
            });

            return Promise.resolve();
        }

        if (wallpaper && !wallpaper.fullSrc) {
            bindConsole.log('Wallpaper not loaded. Fetch...');
            let urls;

            try {
                urls = await WallpapersUniversalService.fetch(wallpaper, {
                    preview: false,
                    cacheTime: 'temp',
                });
            } catch (e) {
                bindConsole.error('Failed fetch wallpaper', e);
                captureException(e);

                return Promise.reject(e);
            }

            return this.set(new Wallpaper({
                ...wallpaper,
                ...urls,
                kind: 'media',
                isLoad: true,
            }));
        }

        if (this.storage.bgCurrent?.id === wallpaper?.id) {
            this.storage.update({ wallpaperState: BG_SHOW_STATE.DONE });
            return Promise.resolve();
        }

        if (!wallpaper) {
            bindConsole.warn('Set empty wallpaper...');

            this.storage.update({
                bgCurrent: null,
                wallpaperState: BG_SHOW_STATE.NOT_FOUND,
            });

            return Promise.resolve();
        }

        // if (this.bgShowMode === BG_SHOW_MODE.STATIC) wallpaper.pauseTimestamp = -0.5;

        const isSaved = (await db().count('backgrounds', wallpaper.id)) !== 0;

        this.storage.update({
            bgCurrent: {
                ...wallpaper,
                kind: 'media',
                isSaved,
            },
            wallpaperState: BG_SHOW_STATE.DONE,
        });

        return Promise.resolve();
    }

    subscribe() {
        this.stream = new StreamWallpapersService(this.core);
        this.local = new LocalWallpapersService(this.core);
        this.color = new ColorWallpapersService(this.core);

        reaction(
            () => JSON.stringify(this.settings.kind),
            () => {
                bindConsole.log(
                    'Change \'kind\'. New selection method:',
                    toJS(this.settings.kind),
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

                this._reCalcScheduler();
            },
        );

        reaction(
            () => `${this.storage.data.wallpapersStreamQuery?.type}${this.storage.data.wallpapersStreamQuery?.value}`,
            () => {
                bindConsole.log(
                    'Change stream query. Reload worker... New query:',
                    toJS(this.storage.data.wallpapersStreamQuery),
                );

                this._changeMood();
            },
        );

        this.core.globalEventBus.on('wallpapers/rate', ({ data: { wallpaperId, rate }, callback }) => {
            this.rate(wallpaperId, rate).finally(callback);
        });
        this.core.globalEventBus.on('wallpapers/next', () => this.next());
        this.core.globalEventBus.on('wallpapers/set', ({ data: bg, callback }) => {
            this.set(bg).finally(callback);
        });

        setTimeout(() => {
            this._startScheduler();
        });
    }
}

export default WallpapersService;
