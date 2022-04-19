import { action, makeAutoObservable, reaction } from 'mobx';
import { BKMS_FAP_STYLE, DESTINATION } from '@/enum';
import WorkingSpaceSettings from '@/stores/universal/settings/workingSpace';
import FavoritesUniversalService from '@/stores/universal/workingSpace/favorites';
import TagsStore from './tags';
import FoldersStore from './folders';
import BookmarksStore from './bookmarks';

class WorkingSpaceService {
    tags;
    bookmarks;
    folders;
    favorites = [];
    _coreService;
    settings;

    constructor(coreService) {
        makeAutoObservable(this);
        this._coreService = coreService;
        this.tags = new TagsStore(coreService, this);
        this.folders = new FoldersStore(coreService, this);
        this.bookmarks = new BookmarksStore(coreService, this);
        this.settings = new WorkingSpaceSettings();

        if (!this._coreService) return;

        this.syncFavorites();

        this._coreService.globalEventBus.on('bookmark/new', () => {
            this._coreService.storage.update({ bkmsLastTruthSearchTimestamp: Date.now() });
        });
        this._coreService.globalEventBus.on('bookmark/removed', async () => {
            this._coreService.storage.update({ bkmsLastTruthSearchTimestamp: Date.now() });
            await this.syncFavorites();
        });
        this._coreService.globalEventBus.on('tag/new', async () => {
            this._coreService.storage.update({ bkmsLastTruthSearchTimestamp: Date.now() });
        });
        this._coreService.globalEventBus.on('tag/removed', async () => {
            this._coreService.storage.update({ bkmsLastTruthSearchTimestamp: Date.now() });

            await this.syncFavorites();
        });
        this._coreService.globalEventBus.on('folder/removed', async () => {
            this._coreService.storage.update({ bkmsLastTruthSearchTimestamp: Date.now() });
            await this.syncFavorites();
        });
        this._coreService.globalEventBus.on('folder/new', async () => {
            this._coreService.storage.update({ bkmsLastTruthSearchTimestamp: Date.now() });
        });
        this._coreService.globalEventBus.on('favorite/new', () => this.syncFavorites());
        this._coreService.globalEventBus.on('favorite/remove', () => this.syncFavorites());
    }

    get lastSearch() {
        return this._coreService.storage.data.bkmsLastSearch;
    }

    get lastTruthSearchTimestamp() {
        return this._coreService.storage.data.bkmsLastTruthSearchTimestamp;
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

        this._coreService.globalEventBus.call('favorite/new', DESTINATION.APP, { favoriteId: favorite.id });

        return favoriteId;
    }

    @action('add to favorites')
    async removeFromFavorites(favoriteId) {
        console.log('removeFromFavorites', favoriteId);
        await FavoritesUniversalService.removeFromFavorites(favoriteId);

        this._coreService.globalEventBus.call('favorite/remove', DESTINATION.APP, { favoriteId });

        return favoriteId;
    }
}

export default WorkingSpaceService;
