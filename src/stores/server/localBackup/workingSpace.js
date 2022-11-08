import { makeAutoObservable } from 'mobx';
import { omit, uniq } from 'lodash';
import { captureException } from '@sentry/browser';
import BookmarksUniversalService from '@/stores/universal/workingSpace/bookmarks';
import FavoritesUniversalService from '@/stores/universal/workingSpace/favorites';
import FoldersUniversalService from '@/stores/universal/workingSpace/folders';
import TagsUniversalService from '@/stores/universal/workingSpace/tags';
import Favorite from '@/stores/universal/workingSpace/entities/favorite';
import fetchData from '@/utils/helpers/fetchData';
import { FIRST_UUID, NULL_UUID } from '@/utils/generate/uuid';
import { search } from '@/stores/universal/workingSpace/search';
import db from '@/utils/db';

class WorkingSpace {
    core;

    constructor(core) {
        makeAutoObservable(this);
        this.core = core;
    }

    async collect() {
        if (BUILD !== 'full') return {};

        // Collect tags

        const tagsReplaceIds = {};

        const tags = await TagsUniversalService.getAll();

        tags.forEach((tag) => {
            tagsReplaceIds[tag.id] = Object.keys(tagsReplaceIds).length;

            tag.id = tagsReplaceIds[tag.id];
        });

        // Collect folders

        const foldersReplaceIds = {
            NULL_UUID: 0,
            FIRST_UUID: 1,
        };

        const folders = await db().getAll('folders');

        folders.forEach((folder) => {
            if (!(folder.id in foldersReplaceIds)) foldersReplaceIds[folder.id] = Object.keys(foldersReplaceIds).length;

            folder.id = foldersReplaceIds[folder.id];
        });

        folders.forEach((folder) => {
            folder.parentId = foldersReplaceIds[folder.parentId];
        });

        // Collect bookmarks

        const bookmarksReplaceIds = {};

        const { all: bookmarksAll } = await search();

        const bookmarks = await Promise.all(bookmarksAll.map(async (bookmark) => {
            let image;

            try {
                const { response } = await fetchData(bookmark.icoUrl, { responseType: 'blob' });

                image = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(response);
                    reader.onloadend = () => resolve(reader.result);
                    reader.onerror = reject;
                });
            } catch (e) {
                captureException(e);
                console.warn('Failed get icon', e, bookmark);
            }

            bookmarksReplaceIds[bookmark.id] = Object.keys(bookmarksReplaceIds).length;

            return {
                ...omit(bookmark, ['icoFileName', 'icoUrl', 'tagsFull']),
                id: bookmarksReplaceIds[bookmark.id],
                folderId: foldersReplaceIds[bookmark.folderId],
                tags: bookmark.tags.map((tagId) => tagsReplaceIds[tagId]),
                image,
            };
        }));

        // Collect favorites

        let favorites = await FavoritesUniversalService.getAll();

        favorites = favorites.map((favorite) => {
            if (favorite.itemType === 'folder') {
                favorite.itemId = foldersReplaceIds[favorite.itemId];
            } else if (favorite.itemType === 'bookmark') {
                favorite.itemId = bookmarksReplaceIds[favorite.itemId];
            } else if (favorite.itemType === 'tag') {
                favorite.itemId = tagsReplaceIds[favorite.itemId];
            }

            return omit(favorite, ['id']);
        });

        return {
            tags,
            folders,
            favorites,
            bookmarks,
        };
    }

    async restore({ tags, folders, bookmarks, favorites }) {
        console.log('restore bookmarks', {
            bookmarks,
            tags,
            folders,
            favorites,
        }, this.core);

        const { all: localBookmarks } = await search();
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

        const replaceFolderId = {
            0: NULL_UUID,
            1: FIRST_UUID,
        };

        const compareLevel = async (level, localLevel) => {
            for await (const folder of level) {
                console.log('Check folder:', folder);

                const findFolder = localLevel.find(({ name }) => folder.name === name);

                if (findFolder) {
                    console.log(`Folder '${folder.name}' find in local store. Rewrite local`);
                    await FoldersUniversalService.save({
                        ...findFolder,
                        ...folder,
                        parentId: replaceFolderId[folder.parentId || 0],
                        id: findFolder.id,
                    });

                    replaceFolderId[folder.id] = findFolder.id;
                } else {
                    console.log(`Folder '${folder.name}' not find in local store. Save as new`);
                    replaceFolderId[folder.id] = await FoldersUniversalService.save({
                        ...folder,
                        parentId: replaceFolderId[folder.parentId || 0],
                        id: null,
                    });
                }

                if (Array.isArray(folder.children)) await compareLevel(folder.children, findFolder?.children || []);
            }
        };

        if (folders) await compareLevel(folders, localFolders);

        console.log('Restore tags...');

        const replaceTagId = {};

        for await (const tag of tags) {
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

        for await (const bookmark of bookmarks) {
            console.log('Check bookmark:', bookmark);

            const findBookmark = localBookmarks.find(({ url }) => bookmark.url === url);

            if (findBookmark) {
                console.log(`Bookmark '${bookmark.name}' find in local store. Rewrite local`);
                await BookmarksUniversalService.save({
                    ...findBookmark,
                    ...bookmark,
                    id: findBookmark.id,
                    folderId: replaceFolderId[bookmark.folderId] || bookmark.folderId || findBookmark.folderId,
                    imageBase64: bookmark.imageBase64,
                    tags: uniq([
                        ...findBookmark.tags,
                        ...bookmark.tags.map((id) => replaceTagId[id] || id),
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
                    imageBase64: bookmark.imageBase64,
                    tags: bookmark.tags.map((id) => replaceTagId[id] || id),
                    id: null,
                });
                console.log('Bookmark id', replaceBookmarkId[bookmark.id]);
            }
        }

        console.log('Restore favorites...');

        for await (const favorite of favorites) {
            console.log('Check favorite:', favorite);

            const favType = favorite.itemType;
            const favId = favorite.itemId;

            const replaceIdByType = {
                bookmark: replaceBookmarkId,
                folder: replaceFolderId,
                tag: replaceTagId,
            };

            const favoriteItemId = replaceIdByType[favType][favId];

            const findFavorite = localFavorites.find(({ itemType, itemId }) => (
                favType === itemType && favoriteItemId === itemId
            ));

            if (!findFavorite) {
                console.log('Save new favorite', favorite, 'as', {
                    itemType: favType,
                    itemId: favoriteItemId,
                });
                await FavoritesUniversalService.addToFavorites(new Favorite({
                    itemType: favType,
                    itemId: favoriteItemId,
                }));
            }
        }

        console.log('All data restored!');
    }
}

export default WorkingSpace;
