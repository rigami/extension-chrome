import { uniq } from 'lodash';
import { makeAutoObservable } from 'mobx';

class SyncBookmarks {
    core;

    constructor(core) {
        makeAutoObservable(this);
        this.core = core;
    }

    async restore(bookmarks) {
        console.log('restore bookmarks', bookmarks);

        const bookmarksQuery = await this.core.bookmarksService.bookmarks.query();
        const localBookmarks = bookmarksQuery[0].bookmarks;
        const localCategories = await this.core.bookmarksService.categories.sync();
        const localFolders = await this.core.bookmarksService.folders.getTree();
        const localFavorites = await this.core.bookmarksService.syncFavorites();

        console.log('localBookmarks', {
            localBookmarks,
            localCategories,
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
                    await this.core.bookmarksService.folders.save({
                        ...findFolder,
                        ...folder,
                        id: findFolder.id,
                    });

                    replaceFolderId[folder.id] = findFolder.id;
                } else {
                    console.log(`Folder '${folder.name}' not find in local store. Save as new`);
                    replaceFolderId[folder.id] = await this.core.bookmarksService.folders.save({
                        ...folder,
                        id: null,
                    });
                }

                if (Array.isArray(folder.children)) await compareLevel(folder.children, findFolder?.children || []);
            }
        };

        if (bookmarks.folders) await compareLevel(bookmarks.folders, localFolders);

        console.log('Restore categories...');

        const replaceCategoryId = {};

        for (const category of bookmarks.categories) {
            console.log('Check category:', category);
            const findCategory = localCategories.find(({ name }) => category.name === name);

            if (findCategory) {
                console.log(`Category '${category.name}' find in local store. Rewrite local`);
                await this.core.bookmarksService.categories.save({
                    ...findCategory,
                    ...category,
                    id: findCategory.id,
                    color: findCategory.color,
                });

                replaceCategoryId[category.id] = findCategory.id;
            } else {
                console.log(`Category '${category.name}' not find in local store. Save as new`);
                replaceCategoryId[category.id] = await this.core.bookmarksService.categories.save({
                    ...category,
                    color: null,
                    id: null,
                });
                console.log('Category id', replaceCategoryId[category.id]);
            }
        }

        console.log('Restore bookmarks...');

        const replaceBookmarkId = {};

        for (const bookmark of bookmarks.bookmarks) {
            console.log('Check bookmark:', bookmark);

            const findBookmark = localBookmarks.find(({ url }) => bookmark.url === url);

            if (findBookmark) {
                console.log(`Bookmark '${bookmark.name}' find in local store. Rewrite local`);
                await this.core.bookmarksService.bookmarks.save({
                    ...findBookmark,
                    ...bookmark,
                    id: findBookmark.id,
                    folderId: replaceFolderId[bookmark.folderId] || bookmark.folderId || findBookmark.folderId,
                    imageBase64: bookmark.image || bookmark.imageBase64,
                    categories: uniq([...findBookmark.categories.map(({ id }) => id), ...bookmark.categories.map((id) => replaceCategoryId[id] || id)]),
                });

                replaceBookmarkId[bookmark.id] = findBookmark.id;
            } else {
                console.log(`Bookmark '${bookmark.name}' not find in local store. Save as new`);
                replaceBookmarkId[bookmark.id] = await this.core.bookmarksService.bookmarks.save({
                    ...bookmark,
                    folderId: replaceFolderId[bookmark.folderId] || bookmark.folderId || 1,
                    imageBase64: bookmark.image || bookmark.imageBase64,
                    categories: bookmark.categories.map((id) => replaceCategoryId[id] || id),
                    id: null,
                });
                console.log('Bookmark id', replaceBookmarkId[bookmark.id]);
            }
        }

        console.log('Restore favorites...');

        for (const favorite of bookmarks.favorites) {
            console.log('Check favorite:', favorite);

            const favoriteId = (
                (favorite.type === 'bookmark' && (replaceBookmarkId[favorite.id] || favorite.id))
                || (favorite.type === 'category' && (replaceCategoryId[favorite.id] || favorite.id))
            );

            const findBookmark = localFavorites.find(({ type, id }) => favorite.type === type && favoriteId === id);

            if (!findBookmark) {
                console.log('Save new favorite', favorite);
                await this.core.bookmarksService.addToFavorites({
                    ...favorite,
                    id: favoriteId,
                });
            }
        }

        console.log('All data restored!');
    }
}

export default SyncBookmarks;
