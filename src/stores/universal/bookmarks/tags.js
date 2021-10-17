import { action } from 'mobx';
import db from '@/utils/db';
import getUniqueColor from '@/utils/generate/uniqueColor';
import { last } from 'lodash';
import FavoritesUniversalService from '@/stores/universal/bookmarks/favorites';
import Tag from '@/stores/universal/bookmarks/entities/tag';
import BookmarksUniversalService, { SearchQuery } from '@/stores/universal/bookmarks/bookmarks';
import nowInISO from '@/utils/nowInISO';
import { v4 as UUIDv4 } from 'uuid';

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

        let saveTagId = id;
        let actionWithBookmark;

        if (id) {
            await db().put('tags', {
                id,
                name: name.trim(),
                color: newColor,
                createTimestamp: oldTag.createTimestamp || Date.now(),
                modifiedTimestamp: Date.now(),
            });
            actionWithBookmark = 'update';
        } else {
            saveTagId = await db().add('tags', {
                id: UUIDv4(),
                name: name.trim(),
                color: newColor,
                createTimestamp: Date.now(),
                modifiedTimestamp: Date.now(),
            });
            actionWithBookmark = 'create';
        }

        if (sync) {
            // TODO: If only user register
            await db().add('tags_wait_sync', {
                action: actionWithBookmark,
                commitDate: nowInISO(),
                tagId: saveTagId,
            });
        }

        return saveTagId;
    }

    @action('remove tag')
    static async remove(tagId, sync = true) {
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

        if (sync) {
            // TODO: If only enabling sync
            await db().add('tags_wait_sync', {
                action: 'delete',
                commitDate: nowInISO(),
                tagId,
            });
        }

        return Promise.resolve();
    }
}

export default TagsUniversalService;
