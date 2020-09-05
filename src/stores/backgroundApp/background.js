import BookmarksStore from '@/stores/bookmarks/bookmarks';
import BusApp from '@/stores/backgroundApp/busApp';
import SyncSettings from './syncSettings';
import SyncStorage from './syncStorage';
import SyncSystemBookmarks from './syncSystemBookmarks';
import LocalBackup from './localBackup';

class Background {
    bus;
    settingsService;
    storageService;
    systemBookmarksService;
    localBackup;
    bookmarks;

    constructor() {
        this.bus = BusApp();
        this.bookmarks = new BookmarksStore(this.bus);
        this.settingsService = new SyncSettings();
        this.storageService = new SyncStorage();
        this.localBackup = new LocalBackup(this.bookmarks, this.settingsService);
        this.systemBookmarksService = new SyncSystemBookmarks();
    }
}

export default Background;
