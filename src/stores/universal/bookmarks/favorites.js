import { action } from 'mobx';
import DBConnector from '@/utils/dbConnector';
import Favorite from '@/stores/universal/bookmarks/entities/favorite';

class FavoritesUniversalService {
    @action('get all favorites')
    static async getAll() {
        const favorites = await DBConnector().getAll('favorites');

        return favorites.map(({ favoriteId, type }) => new Favorite({
            id: favoriteId,
            type,
        }));
    }

    @action('add to favorites')
    static async addToFavorites({ type, id }) {
        return await DBConnector()
            .add('favorites', {
                type,
                favoriteId: id,
            });
    }

    @action('add to favorites')
    static async removeFromFavorites({ type, id }) {
        const favoriteIds = await DBConnector().getAllFromIndex(
            'favorites',
            'favorite_id',
            id,
        );

        const favorite = favoriteIds.find((checkFavorite) => checkFavorite.type === type);

        if (!favorite) return;

        await DBConnector().delete('favorites', favorite.id);

        return favorite.id;
    }
}

export default FavoritesUniversalService;
