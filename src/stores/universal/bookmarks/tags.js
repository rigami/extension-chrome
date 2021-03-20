import { action } from 'mobx';
import DBConnector from '@/utils/dbConnector';
import getUniqueColor from '@/utils/uniqueColor';
import { last } from 'lodash';
import FavoritesUniversalService from '@/stores/universal/bookmarks/favorites';
import Tag from '@/stores/universal/bookmarks/entities/tag';

class TagsUniversalService {
    @action
    static async getAll() {
        const tags = await DBConnector().getAll('tags');

        return tags.map((tag) => new Tag(tag));
    }

    @action('get tag by id')
    static async get(tagId) {
        const tag = await DBConnector().get('tags', tagId);

        return new Tag(tag);
    }

    @action('save tag')
    static async save({ name, id, color }) {
        let newColor;

        if (!id) {
            const allIds = await DBConnector().getAllKeys('tags');
            newColor = color || getUniqueColor(last(allIds));
            newColor = color || getUniqueColor((last(allIds) || 0) + 1);
        } else {
            newColor = color || this.get(id).color;
        }

        const similarTag = await DBConnector().getFromIndex('tags', 'name', name.trim());

        if (similarTag && similarTag.id !== id) {
            return similarTag?.id;
        }

        let newTagId = id;

        if (id) {
            await DBConnector().put('tags', {
                id,
                name: name.trim(),
                color: newColor,
            });
        } else {
            newTagId = await DBConnector().add('tags', {
                name: name.trim(),
                color: newColor,
            });
        }

        return newTagId;
    }

    @action('remove tag')
    static async remove(tagId) {
        const favoriteItem = FavoritesUniversalService.findFavorite({
            itemType: 'tag',
            itemId: tagId,
        });

        if (favoriteItem) {
            await FavoritesUniversalService.removeFromFavorites(favoriteItem.id);
        }

        await DBConnector().delete('tags', tagId);

        const removeBinds = await DBConnector().getAllFromIndex(
            'bookmarks_by_tags',
            'tag_id',
            tagId,
        );

        await Promise.all(removeBinds.map(({ id }) => DBConnector().delete('bookmarks_by_tags', id)));

        return removeBinds;
    }
}

export default TagsUniversalService;
