import { action } from 'mobx';
import { cloneDeep } from 'lodash';
import { captureException } from '@sentry/browser';
import db from '@/utils/db';
import Bookmark from '@/stores/universal/bookmarks/entities/bookmark';
import FavoritesUniversalService from '@/stores/universal/bookmarks/favorites';
import { search as searchLight } from '@/stores/universal/bookmarks/search';
import appVariables from '@/config/config';
import getPreview from '@/utils/createPreview';
import { BG_TYPE } from '@/enum';
import { uuid } from '@/utils/generate/uuid';
import nowInISO from '@/utils/nowInISO';
import { SearchQuery } from './searchQuery';
import api from '@/utils/helpers/api';

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
            folderId,
            tags: tags.filter((isExist) => isExist),
        };

        let saveBookmarkId;
        let saveIcoUrl;

        if (sourceIcoUrl) {
            saveIcoUrl = api.computeUrl(`site-parse/processing-image?url=${encodeURIComponent(sourceIcoUrl)}`);
        }

        if (imageBase64 && !sourceIcoUrl) {
            saveIcoUrl = api.computeUrl(`site-parse/processing-image?site-url=${encodeURIComponent(url)}`);
        }

        if (id) {
            const oldBookmark = id ? await this.get(id) : null;
            const newBookmark = cloneDeep({
                id,
                ...saveData,
                icoUrl: saveIcoUrl,
                sourceIcoUrl,
                createTimestamp: oldBookmark?.createTimestamp || Date.now(),
                modifiedTimestamp: Date.now(),
            });

            saveBookmarkId = await db().put('bookmarks', newBookmark);

            const pairRow = await db().get('pair_with_cloud', `bookmark_${saveBookmarkId}`);

            if (sync && pairRow) {
                await db().put('pair_with_cloud', {
                    ...pairRow,
                    isSync: +false,
                    modifiedTimestamp: Date.now(),
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
                    modifiedTimestamp: Date.now(),
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
                        modifiedTimestamp: Date.now(),
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

                const cache = await caches.open('icons');
                const iconResponse = new Response(blob);

                await cache.put(saveIcoUrl, iconResponse);
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

    @action('query bookmarks')
    static async query(searchRequest) {
        try {
            return searchLight(searchRequest);
        } catch (e) {
            console.error(e);
            captureException(e);

            return Promise.reject(e);
        }
    }
}

export { SearchQuery };

export default BookmarksUniversalService;
