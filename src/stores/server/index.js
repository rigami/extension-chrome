import EventBus from '@/utils/eventBus';
import BusService, { eventToApp, eventToPopup, initBus } from '@/stores/universal/serviceBus';
import Storage, { StorageConnector } from '@/stores/universal/storage';
import { DESTINATION } from '@/enum';
import appVariables from '@/config/appVariables';
import awaitInstallStorage from '@/utils/helpers/awaitInstallStorage';
import FactorySettingsService from './factorySettingsService';
import SyncChromeBookmarksService from './localSync/syncChromeBookmarksService';
import CloudSyncService from './cloudSync';
import authStorage from '@/stores/universal/AuthStorage';
import SettingsService from './settingsService';
import LocalBackupService from './localBackup';
import BookmarksService from './bookmarksService';
import WeatherService from './weatherService';
import WallpapersService from './wallpapers';

class ServerApp {
    localBus;
    globalEventBus;
    storage;
    settingsService;
    localBackupService;
    cloudSyncService;
    systemBookmarksService;
    bookmarksService;
    weatherService;
    wallpapersService;
    factorySettingsService;
    isOffline = !self.navigator.onLine;

    constructor() {
        console.time('Starting server time');
        // App core
        initBus(DESTINATION.BACKGROUND);
        this.localBus = new EventBus();
        this.globalEventBus = BusService();

        // eslint-disable-next-line sonarjs/no-duplicate-string
        this.globalEventBus.on('system.forceReload', () => {
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
            authStorage,
            this.settingsService.settings,
            this.settingsService.backgrounds,
            this.settingsService.widgets,
            this.settingsService.bookmarks,
        ].map((storage) => awaitInstallStorage(storage)));

        console.log(
            'wallpapers storage state',
            JSON.stringify(this.settingsService.backgrounds.type),
            JSON.stringify(this.settingsService.backgrounds._data.type),
        );
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
        this.wallpapersService = new WallpapersService(this);

        // Local backup
        this.localBackupService = new LocalBackupService(this);

        // Cloud Sync
        this.cloudSyncService = new CloudSyncService(this);

        // Local Sync
        if (BUILD === 'full') { this.systemBookmarksService = new SyncChromeBookmarksService(this); }

        // Other
        this.factorySettingsService = new FactorySettingsService(this);

        console.log('Server app is run!');
    }
}

export default ServerApp;
