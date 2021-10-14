import { action } from 'mobx';
import db from '@/utils/db';
import Bookmark from '@/stores/universal/bookmarks/entities/bookmark';
import FavoritesUniversalService from '@/stores/universal/bookmarks/favorites';
import { search as searchLight } from '@/stores/universal/bookmarks/search';
import { cloneDeep } from 'lodash';
import { captureException } from '@sentry/browser';
import appVariables from '@/config/appVariables';
import getPreview from '@/utils/createPreview';
import { BG_TYPE } from '@/enum';
import { v4 as UUIDv4 } from 'uuid';
import nowInISO from '@/utils/nowInISO';
import { SearchQuery } from './searchQuery';

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
        let action;

        if (sourceIcoUrl) {
            saveIcoUrl = `${appVariables.rest.url}/background/get-site-icon?ico-url=${encodeURIComponent(sourceIcoUrl)}`;
        } else if (imageBase64) {
            saveIcoUrl = `${appVariables.rest.url}/background/get-site-icon?site-url=${url}`;
        }

        if (id) {
            const oldBookmark = await this.get(id);

            saveBookmarkId = await db().put('bookmarks', cloneDeep({
                id,
                ...saveData,
                icoUrl: saveIcoUrl,
                createTimestamp: oldBookmark.createTimestamp || Date.now(),
                modifiedTimestamp: Date.now(),
            }));
            action = 'update';
        } else {
            try {
                saveBookmarkId = await db().add('bookmarks', cloneDeep({
                    ...saveData,
                    id: UUIDv4(),
                    icoUrl: saveIcoUrl,
                    createTimestamp: Date.now(),
                    modifiedTimestamp: Date.now(),
                }));
            } catch (e) {
                console.error(e);
                captureException(e);
                throw new Error('Similar bookmark already exist');
            }
            action = 'create';
        }
        if (imageBase64 || sourceIcoUrl) {
            let blob;

            if (imageBase64) {
                blob = await (await fetch(imageBase64)).blob();
            } else {
                blob = await getPreview(sourceIcoUrl, BG_TYPE.IMAGE, { size: 'full' });
            }

            const cache = await caches.open('icons');
            const iconResponse = new Response(blob);

            await cache.put(saveIcoUrl, iconResponse);
        }

        if (sync) {
            // TODO: If only enabling sync
            await db().add('bookmarks_wait_sync', {
                action,
                commitDate: nowInISO(),
                bookmarkId: saveBookmarkId,
            });
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

        if (sync) {
            // TODO: If only enabling sync
            await db().add('bookmarks_wait_sync', {
                action: 'delete',
                commitDate: nowInISO(),
                bookmarkId,
            });
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
