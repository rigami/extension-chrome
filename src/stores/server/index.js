import EventBus from '@/utils/eventBus';
import BusApp, { eventToApp, eventToPopup, initBus } from '@/stores/server/bus';
import Storage, { StorageConnector } from '@/stores/universal/storage';
import { DESTINATION } from '@/enum';
import { open as openDB } from '@/utils/db';
import * as Sentry from '@sentry/react';
import appVariables from '@/config/appVariables';
import awaitInstallStorage from '@/utils/awaitInstallStorage';
import SettingsService from './settingsService';
import SyncBookmarks from './syncBookmarks';
import LocalBackupService from './localBackupService';
import BookmarksService from './bookmarksService';
import WeatherService from './weatherService';
import BackgroundsService from './backgroundsService';
import SyncBackgrounds from './syncBackgrounds';
import SyncChromeBookmarksService from './syncChromeBookmarksService';

class ServerApp {
    localBus;
    globalBus;
    settingsService;
    storage;
    systemBookmarksService;
    bookmarksSyncService;
    localBackupService;
    bookmarksService;
    weatherService;
    backgroundsService;
    isOffline = !self.navigator.onLine;

    constructor() {
        console.time('Starting server time');
        // App core
        initBus(DESTINATION.BACKGROUND);
        openDB().catch((e) => {
            console.error('Failed init db:', e);
            Sentry.captureException(e);
        });

        this.localBus = new EventBus();
        this.globalBus = BusApp();

        // eslint-disable-next-line sonarjs/no-duplicate-string
        this.globalBus.on('system.forceReload', () => {
            eventToApp('system.forceReload');
            eventToPopup('system.forceReload');

            location.reload();
        });

        self.addEventListener('offline', () => { this.isOffline = true; });
        self.addEventListener('online', () => { this.isOffline = false; });
    }

    async _initStorages() {
        const { storageVersion = 0 } = await StorageConnector.get('storageVersion');

        if (storageVersion !== appVariables.storage.version) {
            console.log('Require upgrade storage version from', storageVersion, 'to', appVariables.storage.version);
        }

        this.storage = new Storage('storage', storageVersion < appVariables.storage.version);
        this.settingsService = new SettingsService(storageVersion < appVariables.storage.version);

        await StorageConnector.set({ storageVersion: appVariables.storage.version });

        await Promise.all([
            this.storage.persistent,
            this.settingsService.settings,
            this.settingsService.backgrounds,
            this.settingsService.widgets,
            this.settingsService.bookmarks,
        ].map((storage) => awaitInstallStorage(storage)));

        console.log('backgrounds storage state', JSON.stringify(this.settingsService.backgrounds.type), JSON.stringify(this.settingsService.backgrounds._data.type));
    }

    async start() {
        console.log('Server app running...');

        await this._initStorages();

        console.log('Storages is sync. Starting server app...');
        console.timeEnd('Starting server time');

        // Bookmarks
        if (BUILD === 'full') { this.bookmarksService = new BookmarksService(this); }

        // Weather
        this.weatherService = new WeatherService(this);

        // Backgrounds
        this.backgroundsService = new BackgroundsService(this);

        // Sync & backup
        if (BUILD === 'full') { this.systemBookmarksService = new SyncChromeBookmarksService(this); }
        if (BUILD === 'full') { this.bookmarksSyncService = new SyncBookmarks(this); }
        this.localBackupService = new LocalBackupService(this);
        this.backgroundsSyncService = new SyncBackgrounds(this);

        console.log('Server app is run!');
    }
}

export default ServerApp;
