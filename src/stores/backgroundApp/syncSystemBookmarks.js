import { BKMS_VARIANT } from '@/enum';
import Bookmark from '@/stores/bookmarks/entities/bookmark';
import Folder from '@/stores/bookmarks/entities/folder';
import BusApp from '@/stores/backgroundApp/busApp';
import BookmarksService from '@/stores/bookmarks';
import settings from '@/config/settings';

class SyncSystemBookmarks {
    bus;
    bookmarksService;
    storageService;

    constructor(storageService) {
        this.bus = BusApp();
        this.bookmarksService = new BookmarksService({ globalEventBus: this.bus });
        this.storageService = storageService;

        if (!chrome?.bookmarks) {
            console.error('Not find bookmarks module');
            return;
        }

        this.bus.on('system/parseSystemBookmarks', () => this.parseSystemBookmarks());
        if (this.bookmarksService.settings.syncWithSystem) {
            this.parseSystemBookmarks();

            chrome.bookmarks.onCreated.addListener(async (id, createInfo) => {
                if (createInfo.url && !('dateGroupModified' in createInfo)) {
                    console.log('onCreated bookmark', id, createInfo);
                    // this.saveBookmark(createInfo);
                } else {
                    console.log('onCreated folder', id, createInfo);
                    // this.saveFolder(createInfo);
                }
            });
            chrome.bookmarks.onMoved.addListener((id, moveInfo) => {
                console.log('onMoved', id, moveInfo);
            });
            chrome.bookmarks.onChanged.addListener(async (id, changeInfo) => {
                console.log('onChanged', id, changeInfo);
            });
            chrome.bookmarks.onRemoved.addListener((id, { node: removedNode, ...removeInfo }) => {
                console.log('onChanged', id, removeInfo, removedNode);
            });
        }
    }

    async saveSystemBookmark(bookmarkId) {
        chrome.bookmarks.get(bookmarkId, async ([bookmark]) => {
            await this.saveBookmark(bookmark);
        });
    }

    async saveBookmark(bookmark) {
        /* const similarBookmarks = await this.bookmarksService.bookmarks.query({
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

        this.bus.call('bookmark/new', DESTINATION.APP, { bookmarkId: newBookmarkId }); */
    }

    async saveFolder(folder) {
        /* const similarBookmarks = await this.bookmarksService.bookmarks.query({
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

        this.bus.call('bookmark/new', DESTINATION.APP, { bookmarkId: newBookmarkId }); */
    }

    async parseSystemBookmarks() {
        const parseNode = async (node, parentId = 0) => {
            if (node.url && !('dateGroupModified' in node)) {
                const saveBookmark = new Bookmark({
                    name: node.title,
                    url: node.url,
                    folderId: parentId,
                });

                console.log('bookmark', saveBookmark);

                await this.bookmarksService.bookmarks.save({
                    description: '',
                    image_url: '',
                    icoVariant: BKMS_VARIANT.SYMBOL,
                    ...saveBookmark,
                    categories: [],
                }, false);
            } else {
                const folder = new Folder({ parentId });

                if (node.id === '0' || node.title === '') {
                    if (!this.bookmarksService.settings.syncMerge) folder.name = settings.bookmarks.sync_default_folder_name;
                    folder.id = this.storageService.storage.syncBrowserFolder;
                } else {
                    folder.name = node.title;
                }

                console.log('create folder:', folder);

                const newFolderId = node.id === '0' && this.storageService.storage.syncBrowserFolder || await this.bookmarksService.folders.save({ ...folder }, false);

                for (let i = 0; i < node.children.length; i += 1) {
                    await parseNode(node.children[i], newFolderId);
                }
            }

            return Promise.resolve();
        };

        chrome.bookmarks.getTree(async (nodes) => {
            for (let i = 0; i < nodes.length; i += 1) {
                await parseNode(nodes[i]);
            }
            console.log('finish sync!');
        });
    }
}

export default SyncSystemBookmarks;
