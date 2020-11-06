import { action, makeAutoObservable, reaction } from 'mobx';
import { DESTINATION } from '@/enum';
import { BookmarksSettingsStore } from '@/stores/app/settings';
import DBConnector from '@/utils/dbConnector';
import CategoriesStore from './categories';
import BookmarksStore from './bookmarks';

class BookmarksService {
    categories;
    bookmarks;
    lastSearch = null;
    lastTruthSearchTimestamp = null;
    favorites = [];
    _coreService;

    constructor(coreService) {
        makeAutoObservable(this);
        this._coreService = coreService;
        this.categories = new CategoriesStore(coreService, this);
        this.bookmarks = new BookmarksStore(coreService, this);
        this.settings = new BookmarksSettingsStore();

        if (!this._coreService) return;

        this.categories.sync();
        this.syncFavorites();

        this._coreService.globalEventBus.on('bookmark/new', () => { this.lastTruthSearchTimestamp = Date.now(); });
        this._coreService.globalEventBus.on('bookmark/remove', () => { this.lastTruthSearchTimestamp = Date.now(); });
        this._coreService.globalEventBus.on('category/new', () => this.categories.sync());
        this._coreService.globalEventBus.on('category/remove', () => this.categories.sync());
        this._coreService.globalEventBus.on('favorite/new', () => this.syncFavorites());
        this._coreService.globalEventBus.on('favorite/remove', () => this.syncFavorites());

        reaction(
            () => this.settings.syncWithSystem,
            () => this._coreService.globalEventBus.call('system/parseSystemBookmarks', DESTINATION.BACKGROUND),
        );
    }

    @action('sync favorites')
    async syncFavorites() {
        const favorites = await DBConnector().getAll('favorites');

        this.favorites = favorites.map(({ favoriteId, type }) => ({
            id: favoriteId,
            type,
        }));

        return this.favorites;
    }

    @action('add to favorites')
    async addToFavorites({ type, id }) {
        const favoriteId = await DBConnector().add('favorites', {
            type,
            favoriteId: id,
        });

        if (this._coreService) this._coreService.globalEventBus.call('favorite/new', DESTINATION.APP, { favoriteId: id });

        return favoriteId;
    }

    @action('add to favorites')
    async removeFromFavorites({ type, id }) {
        this.favorites = this.favorites.filter((fav) => fav.type !== type || fav.id !== id);

        const favoriteIds = await DBConnector().getAllFromIndex(
            'favorites',
            'favorite_id',
            id,
        );

        const favorite = favoriteIds.find((checkFavorite) => checkFavorite.type === type);

        if (!favorite) return;

        await DBConnector().delete('favorites', favorite.id);

        if (this._coreService) this._coreService.globalEventBus.call('favorite/remove', DESTINATION.APP, { favoriteId: id });

        return favorite.id;
    }
}

export default BookmarksService;
