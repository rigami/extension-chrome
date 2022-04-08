import { action } from 'mobx';
import { cloneDeep, last } from 'lodash';
import db from '@/utils/db';
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

        const similarTag = await db().getFromIndex('tags', 'name', name.trim());

        console.log('Similar tag', similarTag, name, id, colorKey);

        if (similarTag && similarTag.id !== id) {
            return similarTag?.id;
        }

        if (!id || !oldTag) {
            const allColorsIds = (await db().getAll('tags')).map((tag) => tag.colorKey).sort((a, b) => a - b);

            let nextColorKey = 1;
            while (allColorsIds[nextColorKey - 1] === nextColorKey && nextColorKey <= allColorsIds.length) {
                nextColorKey += 1;
            }

            newColorKey = similarTag ? nextColorKey : colorKey || nextColorKey;
        } else {
            newColorKey = colorKey || oldTag.colorKey;
        }

        let saveTagId = id;

        if (id || similarTag) {
            console.log('Update tag', similarTag, name, id, newColorKey);
            await db().put('tags', {
                id: id || similarTag?.id,
                name: name.trim(),
                colorKey: newColorKey,
                createTimestamp: oldTag?.createTimestamp || Date.now(),
                modifiedTimestamp: Date.now(),
            });

            const pairRow = await db().get('pair_with_cloud', `tag_${saveTagId}`);

            if (sync && pairRow) {
                await db().put('pair_with_cloud', {
                    ...pairRow,
                    isSync: +false,
                    modifiedTimestamp: Date.now(),
                });
            }
        } else {
            console.log('Create tag', name, id, newColorKey);
            saveTagId = await db().add('tags', {
                id: uuid(),
                name: name.trim(),
                colorKey: newColorKey,
                createTimestamp: Date.now(),
                modifiedTimestamp: Date.now(),
            });

            if (sync) {
                await db().add('pair_with_cloud', {
                    entityType_localId: `tag_${saveTagId}`,
                    entityType: 'tag',
                    localId: saveTagId,
                    cloudId: null,
                    isPair: +false,
                    isSync: +false,
                    isDeleted: +false,
                    modifiedTimestamp: Date.now(),
                });
            }
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

        const { all: bookmarks } = await BookmarksUniversalService.query(new SearchQuery({ tags: [tagId] }));

        await Promise.all(bookmarks.map(({ tags, ...bookmark }) => db().put('bookmarks', cloneDeep({
            ...bookmark,
            tags: tags.filter((id) => id !== tagId),
        }))));

        await db().delete('tags', tagId);

        const pairRow = await db().get('pair_with_cloud', `tag_${tagId}`);

        if (sync && pairRow) {
            if (!pairRow.isPair) {
                await db().delete('pair_with_cloud', `tag_${tagId}`);
            } else {
                await db().put('pair_with_cloud', {
                    ...pairRow,
                    isSync: +false,
                    isDeleted: +true,
                    modifiedTimestamp: Date.now(),
                });

                await Promise.all(bookmarks.map(async ({ id }) => {
                    const pairBookmarkRow = await db().get('pair_with_cloud', `bookmark_${id}`);
                    await db().put('pair_with_cloud', {
                        ...pairBookmarkRow,
                        isSync: +false,
                        modifiedTimestamp: Date.now(),
                    });
                }));
            }
        }

        return Promise.resolve();
    }
}

export default TagsUniversalService;
