import { action } from 'mobx';
import DBConnector from '@/utils/dbConnector';
import getUniqueColor from '@/utils/uniqueColor';
import { last } from 'lodash';
import FavoritesUniversalService from '@/stores/universal/bookmarks/favorites';

class CategoriesUniversalService {
    @action
    static async getAll() {
        return DBConnector().getAll('categories');
    }

    @action('get category by id')
    static async get(categoryId) {
        return DBConnector().get('categories', categoryId);
    }

    @action('save category')
    static async save({ name, id, color }) {
        let newColor;

        if (!id) {
            const allIds = await DBConnector().getAllKeys('categories');
            newColor = color || getUniqueColor(last(allIds));
            newColor = color || getUniqueColor((last(allIds) || 0) + 1);
        } else {
            newColor = color || this.get(id).color;
        }

        const similarCategory = await DBConnector().getFromIndex('categories', 'name', name.trim());

        if (similarCategory && similarCategory.id !== id) {
            return similarCategory?.id;
        }

        let newCategoryId = id;

        if (id) {
            await DBConnector().put('categories', {
                id,
                name: name.trim(),
                color: newColor,
            });
        } else {
            newCategoryId = await DBConnector().add('categories', {
                name: name.trim(),
                color: newColor,
            });
        }

        return newCategoryId;
    }

    @action('remove category')
    static async remove(categoryId) {
        await FavoritesUniversalService.removeFromFavorites({
            type: 'category',
            id: categoryId,
        });

        await DBConnector().delete('categories', categoryId);

        const removeBinds = await DBConnector().getAllFromIndex(
            'bookmarks_by_categories',
            'category_id',
            categoryId,
        );

        await Promise.all(removeBinds.map(({ id }) => DBConnector().delete('bookmarks_by_categories', id)));

        return removeBinds;
    }
}

export default CategoriesUniversalService;
