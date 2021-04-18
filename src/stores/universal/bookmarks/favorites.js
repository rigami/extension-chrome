import { action } from 'mobx';
import db from '@/utils/db';
import Favorite from '@/stores/universal/bookmarks/entities/favorite';

let cacheFavorites = [];

class FavoritesUniversalService {
    @action('get all favorites')
    static async getAll() {
        const favorites = await db().getAll('favorites');

        cacheFavorites = favorites.map((favorite) => new Favorite(favorite));

        return cacheFavorites;
    }

    @action('add to favorites')
    static async addToFavorites(favorite) {
        delete favorite.id;

        const addedFavorite = await db().add('favorites', favorite);

        await this.getAll();

        return addedFavorite;
    }

    @action('find favorite')
    static findFavorite({ itemType, itemId }) {
        return cacheFavorites.find((fav) => fav.itemId === itemId && fav.itemType === itemType);
    }

    @action('remove favorite')
    static async removeFromFavorites(favoriteId) {
        const favorite = await db().get('favorites', favoriteId);

        if (!favorite) return null;

        await db().delete('favorites', favoriteId);

        await this.getAll();

        return favorite;
    }
}

export default FavoritesUniversalService;
