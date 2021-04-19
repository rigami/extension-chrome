import { action } from 'mobx';
import db from '@/utils/db';
import fs from '@/utils/fs';
import Bookmark from '@/stores/universal/bookmarks/entities/bookmark';
import FavoritesUniversalService from '@/stores/universal/bookmarks/favorites';
import getImageBlob from '@/utils/getImageBlob';
import { search as searchLight } from '@/stores/universal/bookmarks/search';
import { cloneDeep } from 'lodash';
import { captureException } from '@sentry/react';
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
            imageURL,
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
            folderId,
            tags: tags.filter((isExist) => isExist),
        };

        let saveBookmarkId;
        let icoName = `${Date.now().toString()}`;

        if (id) {
            const oldBookmark = await this.get(id);
            icoName = oldBookmark.icoFileName || icoName;

            saveBookmarkId = await db().put('bookmarks', cloneDeep({
                id,
                ...saveData,
                icoFileName: oldBookmark.icoFileName,
                version: oldBookmark.version + 1,
            }));
        } else {
            try {
                saveBookmarkId = await db().add('bookmarks', cloneDeep({
                    ...saveData,
                    icoFileName: icoName,
                    version: 1,
                }));
            } catch (e) {
                console.error(e);
                captureException(e);
                throw new Error('Similar bookmark already exist');
            }
        }

        if (imageBase64 || (imageURL && imageURL.substring(0, 11) !== 'filesystem:')) {
            let blob;

            if (imageBase64) {
                blob = await (await fetch(imageBase64)).blob();
            } else {
                blob = await getImageBlob(imageURL);
            }

            await fs().save(`/bookmarksIcons/${icoName}`, blob);
        } else if (!imageURL && id) {
            try {
                await fs().remove(`/bookmarksIcons/${icoName}`);
            } catch (e) {
                console.error(e);
                captureException(e);
            }
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
            await fs().remove(`/bookmarksIcons/${oldBookmark.icoFileName}`);
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
        }
    }
}

export { SearchQuery };

export default BookmarksUniversalService;
