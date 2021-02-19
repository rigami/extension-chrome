import { action } from 'mobx';
import DBConnector from '@/utils/dbConnector';
import Favorite from '@/stores/universal/bookmarks/entities/favorite';

class FavoritesUniversalService {
    @action('get all favorites')
    static async getAll() {
        const favorites = await DBConnector().getAll('favorites');

        return favorites.map((favorite) => new Favorite(favorite));
    }

    @action('add to favorites')
    static async addToFavorites(favorite) {
        delete favorite.id;

        return DBConnector().add('favorites', favorite);
    }

    @action('remove favorite')
    static async removeFromFavorites(favoriteId) {
        const favorite = await DBConnector().get('favorites', favoriteId);

        if (!favorite) return null;

        await DBConnector().delete('favorites', favoriteId);

        return favorite;
    }
}

export default FavoritesUniversalService;
