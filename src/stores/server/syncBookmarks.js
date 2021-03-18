import { uniq } from 'lodash';
import { makeAutoObservable } from 'mobx';
import BookmarksUniversalService from '@/stores/universal/bookmarks/bookmarks';
import FavoritesUniversalService from '@/stores/universal/bookmarks/favorites';
import FoldersUniversalService from '@/stores/universal/bookmarks/folders';
import TagsUniversalService from '@/stores/universal/bookmarks/tags';
import Favorite from '@/stores/universal/bookmarks/entities/favorite';

class SyncBookmarks {
    core;

    constructor(core) {
        makeAutoObservable(this);
        this.core = core;
    }

    async restore(bookmarks) {
        console.log('restore bookmarks', bookmarks, this.core);

        const { all: localBookmarks } = await BookmarksUniversalService.query();
        const localTags = await TagsUniversalService.getAll();
        const localFolders = await FoldersUniversalService.getTree();
        const localFavorites = await FavoritesUniversalService.getAll();

        console.log('localBookmarks', {
            localBookmarks,
            localTags,
            localFavorites,
            localFolders,
        });

        console.log('Restore folders...');

        const replaceFolderId = {};

        const compareLevel = async (level, localLevel) => {
            for (const folder of level) {
                console.log('Check folder:', folder);

                const findFolder = localLevel.find(({ name }) => folder.name === name);

                if (findFolder) {
                    console.log(`Folder '${folder.name}' find in local store. Rewrite local`);
                    await FoldersUniversalService.save({
                        ...findFolder,
                        ...folder,
                        id: findFolder.id,
                    });

                    replaceFolderId[folder.id] = findFolder.id;
                } else {
                    console.log(`Folder '${folder.name}' not find in local store. Save as new`);
                    replaceFolderId[folder.id] = await FoldersUniversalService.save({
                        ...folder,
                        id: null,
                    });
                }

                if (Array.isArray(folder.children)) await compareLevel(folder.children, findFolder?.children || []);
            }
        };

        if (bookmarks.folders) await compareLevel(bookmarks.folders, localFolders);

        console.log('Restore tags...');

        const replaceTagId = {};

        for (const tag of (bookmarks.categories || bookmarks.tags)) {
            console.log('Check tag:', tag);
            const findTag = localTags.find(({ name }) => tag.name === name);

            if (findTag) {
                console.log(`Tag '${tag.name}' find in local store. Rewrite local`);
                await TagsUniversalService.save({
                    ...findTag,
                    ...tag,
                    id: findTag.id,
                    color: findTag.color,
                });

                replaceTagId[tag.id] = findTag.id;
            } else {
                console.log(`Tag '${tag.name}' not find in local store. Save as new`);
                replaceTagId[tag.id] = await TagsUniversalService.save({
                    ...tag,
                    color: null,
                    id: null,
                });
                console.log('Tag id', replaceTagId[tag.id]);
            }
        }

        console.log('Restore bookmarks...');

        const replaceBookmarkId = {};

        for (const bookmark of bookmarks.bookmarks) {
            console.log('Check bookmark:', bookmark);

            const findBookmark = localBookmarks.find(({ url }) => bookmark.url === url);

            if (findBookmark) {
                console.log(`Bookmark '${bookmark.name}' find in local store. Rewrite local`);
                await BookmarksUniversalService.save({
                    ...findBookmark,
                    ...bookmark,
                    id: findBookmark.id,
                    folderId: replaceFolderId[bookmark.folderId] || bookmark.folderId || findBookmark.folderId,
                    imageBase64: bookmark.image || bookmark.imageBase64,
                    tags: uniq([
                        ...findBookmark.tags.map(({ id }) => id),
                        ...(bookmark.categories || bookmark.tags).map((id) => replaceTagId[id] || id),
                        ...[],
                        ...[],
                    ]),
                });

                replaceBookmarkId[bookmark.id] = findBookmark.id;
            } else {
                console.log(`Bookmark '${bookmark.name}' not find in local store. Save as new`);
                replaceBookmarkId[bookmark.id] = await BookmarksUniversalService.save({
                    ...bookmark,
                    folderId: replaceFolderId[bookmark.folderId] || bookmark.folderId || 1,
                    imageBase64: bookmark.image || bookmark.imageBase64,
                    tags: (bookmark.categories || bookmark.tags).map((id) => replaceTagId[id] || id),
                    id: null,
                });
                console.log('Bookmark id', replaceBookmarkId[bookmark.id]);
            }
        }

        console.log('Restore favorites...');

        for (const favorite of bookmarks.favorites) {
            console.log('Check favorite:', favorite);

            const favType = favorite.itemType || favorite.type;
            const favId = favorite.itemId || favorite.id;

            const favoriteItemId = (
                (favType === 'bookmark' && (replaceBookmarkId[favId] || favId))
                || (favType === 'tag' && (replaceTagId[favId] || favId))
                || (favType === 'folder' && (replaceFolderId[favId] || favId))
            );

            const favoriteId = (
                (favType === 'bookmark' && (replaceBookmarkId[favId] || favId))
                || (favType === 'tag' && (replaceTagId[favId] || favId))
                || (favType === 'folder' && (replaceFolderId[favId] || favId))
            );

            const findFavorite = localFavorites.find(({ itemType, itemId }) => (
                favType === itemType && favoriteId === itemId
            ));

            if (!findFavorite) {
                console.log('Save new favorite', favorite);
                await FavoritesUniversalService.addToFavorites(new Favorite({
                    itemType: favType,
                    itemId: favoriteItemId,
                }));
            }
        }

        console.log('All data restored!');
    }
}

export default SyncBookmarks;
