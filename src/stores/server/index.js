import EventBus from '@/utils/eventBus';
import BusService, { eventToApp, eventToPopup, initBus } from '@/stores/universal/serviceBus';
import { DESTINATION } from '@/enum';
import appVariables from '@/config/config';
import awaitInstallStorage from '@/utils/helpers/awaitInstallStorage';
import FactorySettingsService from './factorySettingsService';
import CloudSyncService from './cloudSync';
import authStorage from '@/stores/universal/storage/auth';
import SettingsService from './settingsService';
import LocalBackupService from './localBackup';
import BookmarksService from './bookmarksService';
import WeatherService from './weatherService';
import WallpapersService from './wallpapers';
import OmniboxService from './omniboxService';
import PersistentStorage from '@/stores/universal/storage/persistent';
import StorageConnector from '@/stores/universal/storage/connector';
import cacheManager from '@/utils/cacheManager';
import storageMigrate from './migrateStorage/storage';
import settingsMigrate from './migrateStorage/settings';

class ServerApp {
    localBus;
    globalEventBus;
    storage;
    settingsService;
    localBackupService;
    cloudSyncService;
    systemBookmarksService;
    workingSpaceService;
    weatherService;
    wallpapersService;
    factorySettingsService;
    omniboxService;
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

        this.globalEventBus.on('health-check', ({ callback }) => {
            callback();
        });

        self.addEventListener('offline', () => { this.isOffline = true; });
        self.addEventListener('online', () => { this.isOffline = false; });
    }

    async _initStorages() {
        const { storageVersion = 0 } = await StorageConnector.get('storageVersion');

        this.storage = new PersistentStorage('storage');
        this.settingsService = new SettingsService();

        /* eslint-disable max-len, array-element-newline */
        await Promise.all([
            this.storage,
            authStorage,
            this.settingsService.settingsStorage,
        ].map((storage) => awaitInstallStorage(storage)));
        /* eslint-enable max-len, array-element-newline */

        if (storageVersion !== appVariables.storage.version) {
            console.log(
                'Require upgrade storage version from',
                storageVersion,
                'to',
                appVariables.storage.version,
            );

            await storageMigrate(this.storage, storageVersion, appVariables.storage.version);
            await settingsMigrate(this.settingsService.settingsStorage, storageVersion, appVariables.storage.version);

            await StorageConnector.set({ storageVersion: appVariables.storage.version });
        }
    }

    async start() {
        console.log('Server app running...');

        await this._initStorages();

        console.log('Storages is sync. Starting server app...');
        console.timeEnd('Starting server time');

        // Bookmarks
        if (BUILD === 'full') { this.workingSpaceService = new BookmarksService(this); }

        // Weather
        this.weatherService = new WeatherService(this);

        // Backgrounds
        this.wallpapersService = new WallpapersService(this);

        // Local backup
        this.localBackupService = new LocalBackupService(this);

        // Cloud Sync
        this.cloudSyncService = new CloudSyncService(this);

        // Other
        this.factorySettingsService = new FactorySettingsService(this);

        this.omniboxService = new OmniboxService(this);

        // eslint-disable-next-line sonarjs/no-duplicate-string
        chrome.alarms.get('cache-clear').then((alarm) => {
            const periodInMinutes = appVariables.cache.checkScheduler / (60 * 1000);

            if (alarm && alarm.periodInMinutes === periodInMinutes) return;

            chrome.alarms.clear('cache-clear').finally(() => {
                console.log('[alarms] Create new cache-clear alarm');
                chrome.alarms.create('cache-clear', { periodInMinutes });
            });
        });

        chrome.alarms.onAlarm.addListener(({ name }) => {
            console.log('[alarms] Fire alarm with name =', name);
            if (name !== 'cache-clear') return;

            cacheManager.clean('icons', Date.now() - appVariables.cache.lifetime);
            cacheManager.clean('wallpapers', Date.now() - appVariables.cache.lifetime);
            cacheManager.clean('wallpapers-preview', Date.now() - appVariables.cache.lifetime);
            cacheManager.clean('temp', Date.now() - appVariables.cache.lifetime);
        });

        console.log('Server app is run!');
    }
}

export default ServerApp;
