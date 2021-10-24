import { action } from 'mobx';
import db from '@/utils/db';
import { last } from 'lodash';
import FavoritesUniversalService from '@/stores/universal/bookmarks/favorites';
import Tag from '@/stores/universal/bookmarks/entities/tag';
import BookmarksUniversalService, { SearchQuery } from '@/stores/universal/bookmarks/bookmarks';
import nowInISO from '@/utils/nowInISO';
import { uuid } from '@/utils/generate/uuid';

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
    static async save({ name, id, colorKey }, sync = true) {
        const oldTag = id ? await this.get(id) : null;
        let newColorKey;

        if (!id || !oldTag) {
            const allColorsIds = (await db().getAll('tags')).map((tag) => tag.colorKey).sort((a, b) => a - b);

            let nextColorKey = 1;
            while (allColorsIds[nextColorKey - 1] === nextColorKey && nextColorKey <= allColorsIds.length) {
                nextColorKey += 1;
            }

            newColorKey = colorKey || nextColorKey;
        } else {
            newColorKey = colorKey || oldTag.colorKey;
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
                colorKey: newColorKey,
                createTimestamp: oldTag?.createTimestamp || Date.now(),
                modifiedTimestamp: Date.now(),
            });
            actionWithBookmark = 'update';
        } else {
            saveTagId = await db().add('tags', {
                id: uuid(),
                name: name.trim(),
                colorKey: newColorKey,
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
