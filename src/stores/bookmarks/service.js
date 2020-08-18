import { action, observable } from 'mobx';
import StorageConnector from '@/utils/storageConnector';
import EventBus from '@/utils/eventBus';
import CategoriesStore from "./categories";
import BookmarksStore from "./bookmarks";
import BusApp from "@/stores/backgroundApp/busApp";
import {DESTINATION} from "@/enum";

class BookmarksService {
    @observable fapStyle;
    @observable fapPosition;
    @observable openOnStartup;
    @observable categories;
    @observable bookmarks;
    @observable lastSearch = null;
    @observable lastTruthSearchTimestamp = null;
    @observable favorites = [];
    @observable syncWithSystem;
    eventBus;
    bus;

    constructor() {
        this.eventBus = new EventBus();
        this.categories = new CategoriesStore();
        this.bookmarks = new BookmarksStore();
        this.bus = BusApp();

        StorageConnector.getItem('bkms_fap_style')
            .then((value) => { this.fapStyle = value; })
            .catch((e) => console.error(e));

        StorageConnector.getItem('bkms_fap_position')
            .then((value) => { this.fapPosition = value; })
            .catch((e) => console.error(e));

        StorageConnector.getItem('bkms_open_on_startup')
            .then((value) => { this.openOnStartup = value; })
            .catch((e) => console.error(e));

        StorageConnector.getItem('bkms_sync_with_system')
            .then((value) => { this.syncWithSystem = value; })
            .catch((e) => console.error(e));

        StorageConnector.getJSONItem('bkms_last_search')
            .then((value) => { this.lastSearch = value; });

        this.categories.sync()
            .then(() => StorageConnector.getJSONItem('bkms_favorites')
                .then((value) => { this.favorites = value; })
                .catch((e) => console.error(e)));

        this.bus.on('bookmark/new', () => {
            this.lastTruthSearchTimestamp = Date.now();
        });
        this.bus.on('category/new', () => {
            this.categories.sync();
        });
    }

    @action('set fast access panel style')
    setFAPStyle(style) {
        this.fapStyle = style;

        return StorageConnector.setItem('bkms_fap_style', style);
    }

    @action('set fast access panel position')
    setFAPPosition(position) {
        this.fapPosition = position;

        return StorageConnector.setItem('bkms_fap_position', position);
    }

    @action('set open on startup')
    setOpenOnStartup(position) {
        this.openOnStartup = position;

        return StorageConnector.setItem('bkms_open_on_startup', position);
    }

    @action('set sync with system')
    async setSyncWithSystem(isSync) {
        this.syncWithSystem = isSync;

        await StorageConnector.setItem('bkms_sync_with_system', isSync);

        if (isSync) {
            this.bus.call('system/parseSystemBookmarks', DESTINATION.BACKGROUND);
        } else {
        }
    }

    @action('add to favorites')
    addToFavorites({ type, id }) {
        this.favorites.push({
            type,
            id,
        });

        console.log(this.favorites);

        return StorageConnector.setJSONItem('bkms_favorites', this.favorites);
    }

    @action('add to favorites')
    removeFromFavorites({ type, id }) {
        this.favorites = this.favorites.filter((fav) => fav.type !== type || fav.id !== id);

        console.log(this.favorites);

        return StorageConnector.setJSONItem('bkms_favorites', this.favorites);
    }
}

export default BookmarksService;
