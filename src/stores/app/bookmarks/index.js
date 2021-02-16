import { action, makeAutoObservable, reaction } from 'mobx';
import { BKMS_FAP_STYLE, DESTINATION } from '@/enum';
import { BookmarksSettingsStore } from '@/stores/app/settings';
import FavoritesUniversalService from '@/stores/universal/bookmarks/favorites';
import CategoriesStore from './categories';
import FoldersStore from './folders';
import BookmarksStore from './bookmarks';

class BookmarksService {
    categories;
    bookmarks;
    folders;
    favorites = [];
    fapIsDisplay;
    _coreService;
    settings;

    constructor(coreService) {
        makeAutoObservable(this);
        this._coreService = coreService;
        this.categories = new CategoriesStore(coreService, this);
        this.folders = new FoldersStore(coreService, this);
        this.bookmarks = new BookmarksStore(coreService, this);
        this.settings = new BookmarksSettingsStore();

        if (!this._coreService) return;

        this.categories.sync();
        this.syncFavorites();

        this._coreService.globalEventBus.on('bookmark/new', () => {
            this._coreService.storage.updatePersistent({ bkmsLastTruthSearchTimestamp: Date.now() });
        });
        this._coreService.globalEventBus.on('bookmark/remove', () => {
            this._coreService.storage.updatePersistent({ bkmsLastTruthSearchTimestamp: Date.now() });
        });
        this._coreService.globalEventBus.on('category/new', async () => {
            await this.categories.sync();

            this._coreService.storage.updatePersistent({ bkmsLastTruthSearchTimestamp: Date.now() });
        });
        this._coreService.globalEventBus.on('category/remove', async ({ categoryId }) => {
            await this.categories.sync();

            this._coreService.storage.updatePersistent({
                bkmsLastSearch: {
                    ...(this._coreService.storage.persistent.categories || {}),
                    categories: {
                        match: (this._coreService.storage.persistent.categories || [])
                            .filter((id) => id !== categoryId),
                    },
                },
                bkmsLastTruthSearchTimestamp: Date.now(),
            });

            await this.syncFavorites();
        });
        this._coreService.globalEventBus.on('folder/remove', async () => {
            this._coreService.storage.updatePersistent({ bkmsLastTruthSearchTimestamp: Date.now() });
        });
        this._coreService.globalEventBus.on('folder/new', async () => {
            this._coreService.storage.updatePersistent({ bkmsLastTruthSearchTimestamp: Date.now() });
        });
        this._coreService.globalEventBus.on('favorite/new', () => this.syncFavorites());
        this._coreService.globalEventBus.on('favorite/remove', () => this.syncFavorites());

        reaction(
            () => this.settings.fapStyle,
            () => { this.fapIsDisplay = this.settings.fapStyle !== BKMS_FAP_STYLE.HIDDEN && this.favorites.length; },
        );

        reaction(
            () => this.favorites.length,
            () => { this.fapIsDisplay = this.settings.fapStyle !== BKMS_FAP_STYLE.HIDDEN && this.favorites.length; },
        );
    }

    get lastSearch() {
        return this._coreService.storage.persistent.bkmsLastSearch;
    }

    get lastTruthSearchTimestamp() {
        return this._coreService.storage.persistent.bkmsLastTruthSearchTimestamp;
    }

    @action('sync favorites')
    async syncFavorites() {
        console.log('Sync fav');

        this.favorites = await FavoritesUniversalService.getAll();

        console.log('this.favorites', this.favorites);

        return this.favorites;
    }

    @action('add to favorites')
    async addToFavorites({ type, id }) {
        const favoriteId = await FavoritesUniversalService.addToFavorites({
            type,
            id,
        });

        if (this._coreService) {
            this._coreService.globalEventBus.call('favorite/new', DESTINATION.APP, { favoriteId: id });
        }

        return favoriteId;
    }

    @action('add to favorites')
    async removeFromFavorites({ type, id }) {
        this.favorites = this.favorites.filter((fav) => fav.type !== type || fav.id !== id);

        const favoriteId = await FavoritesUniversalService.removeFromFavorites({
            type,
            id,
        });

        if (this._coreService) {
            this._coreService.globalEventBus.call('favorite/remove', DESTINATION.APP, { favoriteId: id });
        }

        return favoriteId;
    }
}

export default BookmarksService;
