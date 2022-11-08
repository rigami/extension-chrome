import { action } from 'mobx';
import db from '@/utils/db';
import Favorite from './entities/favorite';
import { uuid } from '@/utils/generate/uuid';

let cacheFavorites = [];
let searchCache = {};

class FavoritesUniversalService {
    @action('get all favorites')
    static async getAll() {
        const favorites = await db().getAll('favorites');

        cacheFavorites = favorites.map((favorite) => new Favorite(favorite));

        searchCache = {};

        cacheFavorites.forEach((fav) => {
            searchCache[`${fav.itemType}#${fav.itemId}`] = fav;
        });

        return cacheFavorites;
    }

    @action('add to favorites')
    static async addToFavorites(favorite, sync = true) {
        const addedFavoriteId = await db().add('favorites', {
            ...favorite,
            id: uuid(),
            createTimestamp: Date.now(),
            modifiedTimestamp: Date.now(),
        });

        await this.getAll();

        if (sync) {
            await db().add('pair_with_cloud', {
                entityType_localId: `favorite_${addedFavoriteId}`,
                entityType: 'favorite',
                localId: addedFavoriteId,
                cloudId: null,
                isPair: +false,
                isSync: +false,
                isDeleted: +false,
                modifiedTimestamp: Date.now(),
            });
        }

        return addedFavoriteId;
    }

    @action('find favorite')
    static findFavorite({ itemType, itemId }) {
        return searchCache[`${itemType}#${itemId}`];
    }

    @action('remove favorite')
    static async removeFromFavorites(favoriteId, sync = true) {
        const favorite = await db().get('favorites', favoriteId);

        if (!favorite) return null;

        await db().delete('favorites', favoriteId);

        await this.getAll();

        const pairRow = await db().get('pair_with_cloud', `favorite_${favoriteId}`);

        if (sync && pairRow) {
            if (!pairRow.isPair) {
                await db().delete('pair_with_cloud', `favorite_${favoriteId}`);
            } else {
                await db().put('pair_with_cloud', {
                    ...pairRow,
                    isSync: +false,
                    isDeleted: +true,
                    modifiedTimestamp: Date.now(),
                });
            }
        }
        return favorite;
    }
}

export default FavoritesUniversalService;
