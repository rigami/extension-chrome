import BookmarksService from '@/stores/bookmarks';
import BusApp from '@/stores/backgroundApp/busApp';
import SyncSettings from './syncSettings';
import SyncStorage from './syncStorage';
import SyncSystemBookmarks from './syncSystemBookmarks';
import SyncBookmarks from './syncBookmarks';
import LocalBackup from './localBackup';

class Background {
    bus;
    settingsService;
    storageService;
    systemBookmarksService;
    localBackup;
    bookmarks;
    bookmarksSyncService;
    bookmarksService;

    constructor() {
        this.bus = BusApp();
        this.bookmarksService = new BookmarksService();
        this.bookmarks = this.bookmarksService.bookmarks;
        this.folders = this.bookmarksService.folders;
        this.bookmarksSyncService = new SyncBookmarks(this.bookmarksService);
        this.settingsService = new SyncSettings();
        this.storageService = new SyncStorage();
        this.localBackup = new LocalBackup(this.bookmarks, this.folders, this.settingsService, this.bookmarksSyncService);
        this.systemBookmarksService = new SyncSystemBookmarks(this.storageService);
    }
}

export default Background;
