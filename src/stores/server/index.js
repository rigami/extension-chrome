import SettingsService from './settingsService';
import StorageService from './storageService';
// import SyncSystemBookmarksService from './syncSystemBookmarksService';
import SyncBookmarks from './syncBookmarks';
import LocalBackupService from './localBackupService';
import BookmarksService from './bookmarksService';
import WeatherService from './weather/service';
import BackgroundsService from './backgroundsService';
import EventBus from '@/utils/eventBus';
import BusApp from '@/stores/server/bus';

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

    constructor() {
        // App core
        this.localBus = new EventBus();
        this.globalBus = BusApp();
        this.settingsService = new SettingsService(this);
        this.storageService = new StorageService(this);

        // Sync & backup
        // this.systemBookmarksService = new SyncSystemBookmarksService(this);
        this.bookmarksSyncService = new SyncBookmarks(this);
        this.localBackupService = new LocalBackupService(this);

        // Bookmarks
        this.bookmarksService = new BookmarksService(this);

        // Weather
        this.weatherService = new WeatherService(this);

        // Backgrounds
        this.backgroundsService = new BackgroundsService(this);
    }
}

export default ServerApp;
