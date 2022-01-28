import { makeAutoObservable, reaction, toJS } from 'mobx';
import { captureException } from '@sentry/browser';
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
import api from '@/utils/helpers/api';
import appVariables from '@/config/appVariables';

const bindConsole = consoleBinder('wallpapers');

class WallpapersService {
    stream;
    local;
    storage;
    settings;
    _schedulerTimer;

    constructor(core) {
        makeAutoObservable(this);
        this.core = core;
        this.storage = this.core.storage.persistent;
        this.settings = this.core.settingsService.backgrounds;

        this.subscribe();
    }

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

    async _reCalcScheduler() {
        if (this.settings.changeInterval === BG_CHANGE_INTERVAL.OPEN_TAB) return;

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
        if (this.settings.changeInterval === BG_CHANGE_INTERVAL.OPEN_TAB) return Promise.resolve();

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
        bindConsole.log(`Next wallpaper request. Selection method: ${this.settings.selectionMethod}`);

        if (this.storage.wallpaperState === BG_SHOW_STATE.SEARCH) {
            bindConsole.log('Already searching. Skip next request...');
            return Promise.resolve();
        }

        if (this.settings.selectionMethod === BG_SELECT_MODE.STREAM) {
            this.storage.update({ wallpaperState: BG_SHOW_STATE.SEARCH });

            return this.stream.next();
        }

        bindConsole.log(
            `Request next wallpaper not support for ${this.settings.selectionMethod} selection method. Abort...`,
        );

        return Promise.resolve();
    }

    async rate(wallpaperId, rate) {
        bindConsole.log('Rate wallpaper:', rate, wallpaperId);

        this.storage.update({
            bgCurrent: {
                ...this.storage.data.bgCurrent,
                isLiked: rate === BG_RATE.LIKE,
            },
        });

        await api.post(`wallpapers/${wallpaperId}/${rate?.toLowerCase() || 'reset-rate'}`);
    }

    async set(wallpaper) {
        bindConsole.log('Set wallpaper:', wallpaper);

        if (wallpaper && !wallpaper.fullSrc) {
            bindConsole.log('Wallpaper not loaded. Fetch...');
            let urls;

            try {
                urls = await WallpapersUniversalService.fetch(wallpaper, { preview: false });
            } catch (e) {
                bindConsole.error('Failed fetch wallpaper', e);
                captureException(e);

                return Promise.reject(e);
            }

            return this.set(new Wallpaper({
                ...wallpaper,
                ...urls,
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
                isSaved,
            },
            wallpaperState: BG_SHOW_STATE.DONE,
        });

        return Promise.resolve();
    }

    subscribe() {
        this.stream = new StreamWallpapersService(this.core);
        this.local = new LocalWallpapersService(this.core);

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
