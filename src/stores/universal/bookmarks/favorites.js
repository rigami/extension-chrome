import { action } from 'mobx';
import db from '@/utils/db';
import Favorite from '@/stores/universal/bookmarks/entities/favorite';
import nowInISO from '@/utils/nowInISO';
import { uuid } from '@/utils/generate/uuid';

let cacheFavorites = [];

class FavoritesUniversalService {
    @action('get all favorites')
    static async getAll() {
        const favorites = await db().getAll('favorites');

        cacheFavorites = favorites.map((favorite) => new Favorite(favorite));

        return cacheFavorites;
    }

    @action('add to favorites')
    static async addToFavorites(favorite, sync = true) {
        const addedFavorite = await db().add('favorites', {
            ...favorite,
            id: uuid(),
        });

        await this.getAll();

        /* if (sync) {
            // TODO: If only user register
            await db().add('favorites_wait_sync', {
                action: 'create',
                commitDate: nowInISO(),
                itemType: favorite.itemType,
                itemId: favorite.itemId,
            });
        } */

        return addedFavorite;
    }

    @action('find favorite')
    static findFavorite({ itemType, itemId }) {
        return cacheFavorites.find((fav) => fav.itemId === itemId && fav.itemType === itemType);
    }

    @action('remove favorite')
    static async removeFromFavorites(favoriteId, sync = true) {
        const favorite = await db().get('favorites', favoriteId);

        if (!favorite) return null;

        await db().delete('favorites', favoriteId);

        await this.getAll();

        /* if (sync) {
            // TODO: If only enabling sync
            await db().add('favorites_wait_sync', {
                action: 'delete',
                commitDate: nowInISO(),
                itemType: favorite.itemType,
                itemId: favorite.itemId,
            });
        } */

        return favorite;
    }
}

export default FavoritesUniversalService;
