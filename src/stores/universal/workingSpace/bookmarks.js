import { action } from 'mobx';
import { cloneDeep } from 'lodash';
import { captureException } from '@sentry/browser';
import db from '@/utils/db';
import Bookmark from './entities/bookmark';
import FavoritesUniversalService from './favorites';
import getPreview from '@/utils/createPreview';
import { BG_TYPE } from '@/enum';
import { uuid } from '@/utils/generate/uuid';
import { search as searchLight } from './search';
import api from '@/utils/helpers/api';
import cacheManager from '@/utils/cacheManager';

class BookmarksUniversalService {
    @action('get bookmark')
    static async get(bookmarkId) {
        const bookmark = await db().get('bookmarks', bookmarkId);

        return new Bookmark(bookmark);
    }

    @action('query feature bookmarks')
    static async getAllInFolder(folderId) {
        const bookmarksKeys = await db().getAllFromIndex(
            'bookmarks',
            'folder_id',
            folderId,
        );

        return Promise.all(bookmarksKeys.map(({ id }) => this.get(id)));
    }

    @action('save bookmarks')
    static async save(props, sync = true) {
        const {
            url,
            name,
            description,
            sourceIcoUrl,
            imageBase64,
            icoSafeZone,
            tags = [],
            folderId,
            icoVariant,
            id,
        } = props;

        console.log('Save bookmark', props);

        const saveData = {
            url,
            name: name.trim(),
            description: description && description.trim(),
            icoVariant,
            sourceIcoUrl,
            icoSafeZone,
            folderId,
            tags: tags.filter((isExist) => isExist),
        };

        let saveBookmarkId;
        let saveIcoUrl;
        const modifiedTimestamp = Date.now();

        if (sourceIcoUrl) {
            const params = new URLSearchParams();
            params.set('url', sourceIcoUrl);
            params.set('type', icoVariant.toLowerCase());
            params.set('stamp', modifiedTimestamp.toString());

            saveIcoUrl = api.computeUrl(
                `site-parse/processing-image?${params}`,
            );
        }

        if (imageBase64 && !sourceIcoUrl) {
            const params = new URLSearchParams();
            params.set('site-url', url);
            params.set('stamp', modifiedTimestamp.toString());

            saveIcoUrl = api.computeUrl(
                `site-parse/processing-image?${params}`,
            );
        }

        console.log('Save bookmark sourceIcoUrl', saveIcoUrl);

        if (id) {
            const oldBookmark = id ? await this.get(id) : null;
            const newBookmark = cloneDeep({
                id,
                ...saveData,
                icoUrl: saveIcoUrl,
                sourceIcoUrl,
                createTimestamp: oldBookmark?.createTimestamp || Date.now(),
                modifiedTimestamp,
            });

            saveBookmarkId = await db().put('bookmarks', newBookmark);

            const pairRow = await db().get('pair_with_cloud', `bookmark_${saveBookmarkId}`);

            if (sync && pairRow) {
                await db().put('pair_with_cloud', {
                    ...pairRow,
                    isSync: +false,
                    modifiedTimestamp,
                });
            }
        } else {
            try {
                saveBookmarkId = await db().add('bookmarks', cloneDeep({
                    ...saveData,
                    id: uuid(),
                    icoUrl: saveIcoUrl,
                    sourceIcoUrl,
                    createTimestamp: Date.now(),
                    modifiedTimestamp,
                }));

                if (sync) {
                    await db().add('pair_with_cloud', {
                        entityType_localId: `bookmark_${saveBookmarkId}`,
                        entityType: 'bookmark',
                        localId: saveBookmarkId,
                        cloudId: null,
                        isPair: +false,
                        isSync: +false,
                        isDeleted: +false,
                        modifiedTimestamp,
                    });
                }
            } catch (e) {
                console.error(e);
                captureException(e);
                throw new Error('Similar bookmark already exist');
            }
        }
        if (imageBase64 || sourceIcoUrl) {
            try {
                let blob;

                if (imageBase64) {
                    blob = await (await fetch(imageBase64)).blob();
                } else {
                    blob = await getPreview(saveIcoUrl, BG_TYPE.IMAGE, { size: 'full' });
                }

                await cacheManager.cache('icons', saveIcoUrl, blob);
            } catch (e) {
                console.warn('Failed get image preview', e);
            }
        }

        return saveBookmarkId;
    }

    @action('remove bookmark')
    static async remove(bookmarkId, sync = true) {
        const favoriteItem = FavoritesUniversalService.findFavorite({
            itemType: 'bookmark',
            itemId: bookmarkId,
        });

        if (favoriteItem) {
            await FavoritesUniversalService.removeFromFavorites(favoriteItem.id);
        }

        const oldBookmark = await db().get('bookmarks', bookmarkId);
        await db().delete('bookmarks', bookmarkId);

        try {
            // TODO: Remove bookmark icon from cache
        } catch (e) {
            console.log('Failed remove bookmark icon', e);
            captureException(e);
        }

        const pairRow = await db().get('pair_with_cloud', `bookmark_${bookmarkId}`);

        if (sync && pairRow) {
            if (!pairRow.isPair) {
                await db().delete('pair_with_cloud', `bookmark_${bookmarkId}`);
            } else {
                await db().put('pair_with_cloud', {
                    ...pairRow,
                    isSync: +false,
                    isDeleted: +true,
                    modifiedTimestamp: Date.now(),
                });
            }
        }
    }
}

export default BookmarksUniversalService;
