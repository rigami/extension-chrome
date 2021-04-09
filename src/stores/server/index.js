import EventBus from '@/utils/eventBus';
import BusApp, { eventToApp, eventToPopup } from '@/stores/server/bus';
import { open as openFS } from '@/utils/fs';
import SettingsService from './settingsService';
import StorageService from './storageService';
// import SyncSystemBookmarksService from './syncSystemBookmarksService';
import SyncBookmarks from './syncBookmarks';
import LocalBackupService from './localBackupService';
import BookmarksService from './bookmarksService';
import WeatherService from './weather/service';
import BackgroundsService from './backgroundsService';
import SyncBackgrounds from './syncBackgrounds';

class ServerApp {
    localBus;
    globalBus;
    settingsService;
    storageService;
    // systemBookmarksService;
    bookmarksSyncService;
    localBackupService;
    bookmarksService;
    weatherService;
    backgroundsService;
    isOffline = !window.navigator.onLine;

    constructor() {
        // App core
        openFS();
        this.localBus = new EventBus();
        this.globalBus = BusApp();
        this.settingsService = new SettingsService(this);
        this.storageService = new StorageService(this);

        // Sync & backup
        // this.systemBookmarksService = new SyncSystemBookmarksService(this);
        this.bookmarksSyncService = new SyncBookmarks(this);
        this.localBackupService = new LocalBackupService(this);
        this.backgroundsSyncService = new SyncBackgrounds(this);

        // Bookmarks
        this.bookmarksService = new BookmarksService(this);

        // Weather
        this.weatherService = new WeatherService(this);

        // Backgrounds
        this.backgroundsService = new BackgroundsService(this);

        // eslint-disable-next-line sonarjs/no-duplicate-string
        this.globalBus.on('system.forceReload', () => {
            eventToApp('system.forceReload');
            eventToPopup('system.forceReload');

            location.reload();
        });

        window.addEventListener('offline', () => { this.isOffline = true; });
        window.addEventListener('online', () => { this.isOffline = false; });
    }
}

export default ServerApp;
