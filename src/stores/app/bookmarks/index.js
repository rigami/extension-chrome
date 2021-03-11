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
        console.log('Sync favorites');
        this.favorites = await FavoritesUniversalService.getAll();

        return this.favorites;
    }

    @action('find favorite')
    findFavorite(favorite) {
        return FavoritesUniversalService.findFavorite(favorite);
    }

    @action('add to favorites')
    async addToFavorites(favorite) {
        console.log('addToFavorites', favorite);
        const favoriteId = await FavoritesUniversalService.addToFavorites(favorite);

        if (this._coreService) {
            this._coreService.globalEventBus.call('favorite/new', DESTINATION.APP, { favoriteId: favorite.id });
        }

        return favoriteId;
    }

    @action('add to favorites')
    async removeFromFavorites(favoriteId) {
        console.log('removeFromFavorites', favoriteId);
        await FavoritesUniversalService.removeFromFavorites(favoriteId);

        if (this._coreService) {
            this._coreService.globalEventBus.call('favorite/remove', DESTINATION.APP, { favoriteId });
        }

        return favoriteId;
    }
}

export default BookmarksService;
