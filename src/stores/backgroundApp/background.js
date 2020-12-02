import BookmarksService from '@/stores/bookmarks';
import BusApp, { eventToApp } from '@/stores/backgroundApp/busApp';
import SyncSettings from './syncSettings';
import SyncStorage from './syncStorage';
import SyncSystemBookmarks from './syncSystemBookmarks';
import SyncBookmarks from './syncBookmarks';
import LocalBackup from './localBackup';
import WeatherService from './weatherService';

class Background {
    bus;
    settingsService;
    storageService;
    systemBookmarksService;
    localBackup;
    bookmarks;
    bookmarksSyncService;
    bookmarksService;
    foldersService;
    weatherService;

    constructor() {
        this.bus = BusApp();
        this.bookmarksService = new BookmarksService();
        this.bookmarks = this.bookmarksService.bookmarks;
        this.folders = this.bookmarksService.folders;
        this.bookmarksSyncService = new SyncBookmarks(this.bookmarksService);
        this.settingsService = new SyncSettings();
        this.storageService = new SyncStorage();
        this.localBackup = new LocalBackup(this.bookmarks, this.folders, this.settingsService, this.bookmarksSyncService);
        this.systemBookmarksService = new SyncSystemBookmarks();
        this.weatherService = new WeatherService(this.storageService, this.settingsService);
    }
}

export default Background;
