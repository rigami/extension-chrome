import { action } from 'mobx';
import db from '@/utils/db';
import Bookmark from '@/stores/universal/bookmarks/entities/bookmark';
import FavoritesUniversalService from '@/stores/universal/bookmarks/favorites';
import getImageBlob from '@/utils/getImageBlob';
import { search as searchLight } from '@/stores/universal/bookmarks/search';
import { cloneDeep } from 'lodash';
import { captureException } from '@sentry/react';
import appVariables from '@/config/appVariables';
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
    static async save(props) {
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
        } else {
            try {
                saveBookmarkId = await db().add('bookmarks', cloneDeep({
                    ...saveData,
                    icoUrl: saveIcoUrl,
                    createTimestamp: Date.now(),
                    modifiedTimestamp: Date.now(),
                }));
            } catch (e) {
                console.error(e);
                captureException(e);
                throw new Error('Similar bookmark already exist');
            }
        }
        if (imageBase64 || sourceIcoUrl) {
            let blob;

            if (imageBase64) {
                blob = await (await fetch(imageBase64)).blob();
            } else {
                blob = await getImageBlob(sourceIcoUrl);
            }

            const cache = await caches.open('icons');
            const iconResponse = new Response(blob);

            await cache.put(saveIcoUrl, iconResponse);
        }

        return saveBookmarkId;
    }

    @action('remove bookmark')
    static async remove(bookmarkId) {
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
