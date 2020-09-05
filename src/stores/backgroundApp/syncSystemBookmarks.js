import { BKMS_VARIANT, DESTINATION } from '@/enum';
import Bookmark from '@/stores/bookmarks/entities/bookmark';
import Category from '@/stores/bookmarks/entities/category';
import BusApp from '@/stores/backgroundApp/busApp';
import BookmarksService from '@/stores/bookmarks';

class SyncSystemBookmarks {
    bus;
    bookmarksService;

    constructor() {
        this.bus = BusApp();
        this.bookmarksService = new BookmarksService({ globalEventBus: this.bus });

        if (!chrome?.bookmarks) {
            console.error('Not find bookmarks module');
            return;
        }

        this.bus.on('system/parseSystemBookmarks', () => this.parseSystemBookmarks());

        chrome.bookmarks.onCreated.addListener(async (id, createInfo) => {
            console.log('onCreated bookmark', id, createInfo);

            await this.saveSystemBookmark(id);
        });
        chrome.bookmarks.onMoved.addListener((id, moveInfo) => console.log('onMoved bookmark', id, moveInfo));
        chrome.bookmarks.onChanged.addListener(async (id, changeInfo) => {
            console.log('onChanged bookmark', id, changeInfo);

            await this.saveSystemBookmark(id);
        });
        chrome.bookmarks.onRemoved.addListener((id, removeInfo) => console.log('onRemoved bookmark', id, removeInfo));
    }

    async saveSystemBookmark(bookmarkId) {
        chrome.bookmarks.get(bookmarkId, async ([bookmark]) => {
            await this.saveBookmark(bookmark);
        });
    }

    async saveBookmark(bookmark) {
        const similarBookmarks = await this.bookmarksService.bookmarks.query({
            url: {
                fullMatch: true,
                match: bookmark.url,
            },
        });

        console.log('similarBookmarks', similarBookmarks);
        const similarBookmark = similarBookmarks[0]?.bookmarks?.[0] || {};
        console.log('bookmark', similarBookmark);

        const newBookmarkId = await this.bookmarksService.bookmarks.save({
            url: bookmark.url,
            description: '',
            image_url: '',
            icoVariant: BKMS_VARIANT.SYMBOL,
            ...similarBookmark,
            // id: bookmark.title === similarBookmark.name ? similarBookmark.id : null,
            name: bookmark.name || similarBookmark.name,
            categories: [...(similarBookmark.categories?.map(({ id }) => id) || []), ...bookmark.categories],
        });

        this.bus.call('bookmark/new', DESTINATION.APP, { bookmarkId: newBookmarkId });
    }

    async parseSystemBookmarks() {
        const parseBookmark = async (bookmark) => {
            const saveBookmark = new Bookmark({
                name: bookmark.title,
                url: bookmark.url,
                categories: bookmark.path,
            });

            console.log('bookmark', saveBookmark);

            return await this.saveBookmark(saveBookmark);
        };

        const parseNode = async (node, path) => {
            if (!node.children) {
                return await parseBookmark({
                    ...node,
                    path,
                });
            }

            const category = new Category();

            if (node.id === '0' || node.title === '') {
                category.name = 'Root category';
            } else {
                category.name = node.title;
            }

            console.log('create category:', category);

            const newCategoryId = await this.bookmarksService.categories.save({ ...category });

            for (let i = 0; i < node.children.length; i += 1) {
                await parseNode(node.children[i], [...path, newCategoryId]);
            }

            return Promise.resolve();
        };

        chrome.bookmarks.getTree(async (nodes) => {
            for (let i = 0; i < nodes.length; i += 1) {
                await parseNode(nodes[i], []);
            }
            console.log('finish sync!');
        });
    }
}

export default SyncSystemBookmarks;
