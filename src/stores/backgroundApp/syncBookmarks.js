import BusApp from '@/stores/backgroundApp/busApp';
import { uniq } from 'lodash';

class SyncBookmarks {
    bus;
    bookmarksService;

    constructor(bookmarksService) {
        this.bus = BusApp();
        this.bookmarksService = bookmarksService;
    }

    async restore(bookmarks) {
        console.log('restore bookmarks', bookmarks)

        const bookmarksQuery = await this.bookmarksService.bookmarks.query();
        const localBookmarks = bookmarksQuery[0].bookmarks;
        const localCategories = await this.bookmarksService.categories.sync();
        const localFavorites = await this.bookmarksService.syncFavorites();

        console.log('localBookmarks', { localBookmarks, localCategories, localFavorites })
        console.log('Restore categories...')

        const replaceCategoryId = {};

        for (let category of bookmarks.categories) {
            console.log(`Check category:`, category)
            const findCategory = localCategories.find(({ name }) => category.name === name);

            if (findCategory) {
                console.log(`Category '${category.name}' find in local store. Rewrite local`)
                await this.bookmarksService.categories.save({
                    ...findCategory,
                    ...category,
                });

                replaceCategoryId[category.id] = findCategory.id;
            } else {
                console.log(`Category '${category.name}' not find in local store. Save as new`)
                replaceCategoryId[category.id] = await this.bookmarksService.categories.save({
                    ...category,
                    id: null,
                });
                console.log(`Category id`, replaceCategoryId[category.id])
            }
        }

        console.log('Restore bookmarks...')

        const replaceBookmarkId = {};

        for (let bookmark of bookmarks.bookmarks) {
            console.log(`Check bookmark:`, bookmark)

            const findBookmark = localBookmarks.find(({ url }) => bookmark.url === url);

            if (findBookmark) {
                console.log(`Bookmark '${bookmark.name}' find in local store. Rewrite local`)
                await this.bookmarksService.bookmarks.save({
                    ...findBookmark,
                    ...bookmark,
                    categories: uniq([
                        ...findBookmark.categories,
                        ...bookmark.categories.map((id) => replaceCategoryId[id] || id),
                    ]),
                });

                replaceBookmarkId[bookmark.id] = findBookmark.id;
            } else {
                console.log(`Bookmark '${bookmark.name}' not find in local store. Save as new`)
                replaceBookmarkId[bookmark.id] = await this.bookmarksService.bookmarks.save({
                    ...bookmark,
                    categories: bookmark.categories.map((id) => replaceCategoryId[id] || id),
                    id: null,
                });
                console.log(`Bookmark id`, replaceBookmarkId[bookmark.id])
            }
        }

        console.log('Restore favorites...')

        for (let favorite of bookmarks.favorites) {
            console.log(`Check favorite:`, favorite)

            const favoriteId = (
                (favorite.type === 'bookmark' && (replaceBookmarkId[favorite.id] || favorite.id))
                || (favorite.type === 'category' && (replaceCategoryId[favorite.id] || favorite.id))
            );

            const findBookmark = localFavorites.find(({ type, id }) => favorite.type === type && favoriteId === id);

            if (!findBookmark) {
                console.log(`Save new favorite`, favorite)
                await this.bookmarksService.addToFavorites({
                    ...favorite,
                    id: favoriteId,
                });
            }
        }

        console.log('All data restored!')

    }
}

export default SyncBookmarks;
