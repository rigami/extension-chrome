import { action } from 'mobx';
import db from '@/utils/db';
import getUniqueColor from '@/utils/generate/uniqueColor';
import { last } from 'lodash';
import FavoritesUniversalService from '@/stores/universal/bookmarks/favorites';
import Tag from '@/stores/universal/bookmarks/entities/tag';
import BookmarksUniversalService, { SearchQuery } from '@/stores/universal/bookmarks/bookmarks';

class TagsUniversalService {
    @action
    static async getAll() {
        const tags = await db().getAll('tags');

        return tags.map((tag) => new Tag(tag));
    }

    @action('get tag by id')
    static async get(tagId) {
        const tag = await db().get('tags', tagId);

        return new Tag(tag);
    }

    @action('save tag')
    static async save({ name, id, color }) {
        const oldTag = id ? await this.get(id) : {};
        let newColor;

        if (!id) {
            const allIds = await db().getAllKeys('tags');
            newColor = color || getUniqueColor(last(allIds));
            newColor = color || getUniqueColor((last(allIds) || 0) + 1);
        } else {
            newColor = color || oldTag.color;
        }

        const similarTag = await db().getFromIndex('tags', 'name', name.trim());

        if (similarTag && similarTag.id !== id) {
            return similarTag?.id;
        }

        let newTagId = id;

        if (id) {
            await db().put('tags', {
                id,
                name: name.trim(),
                color: newColor,
            });
        } else {
            newTagId = await db().add('tags', {
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

        await db().delete('tags', tagId);

        const { all: bookmarks } = await BookmarksUniversalService.query(new SearchQuery({ tags: [tagId] }));

        await Promise.all(bookmarks.map(({ tags, ...bookmark }) => db().put('bookmarks', {
            ...bookmark,
            tags: tags.filter((id) => id !== tagId),
        })));

        return Promise.resolve();
    }
}

export default TagsUniversalService;
