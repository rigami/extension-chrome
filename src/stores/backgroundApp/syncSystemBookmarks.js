import { BKMS_VARIANT } from '@/enum';
import Bookmark from '@/stores/bookmarks/entities/bookmark';
import Folder from '@/stores/bookmarks/entities/folder';
import BusApp from '@/stores/backgroundApp/busApp';
import BookmarksService from '@/stores/bookmarks';
import { first } from 'lodash';

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

    async parseSystemBookmarks() {
        const parseNodeBookmark = async (browserNode, rigamiNode, parentId) => {
            console.log('parseNodeBookmark', browserNode, rigamiNode, parentId);

            if (rigamiNode) {
                console.log('use rigami bookmark:', rigamiNode);
            } else {
                const bookmark = new Bookmark({
                    name: browserNode.title,
                    url: browserNode.url,
                    folderId: parentId,
                });

                console.log('create bookmark:', bookmark);

                await this.bookmarksService.bookmarks.save({
                    description: '',
                    image_url: '',
                    icoVariant: BKMS_VARIANT.SYMBOL,
                    ...bookmark,
                    categories: [],
                }, false);
            }

            return Promise.resolve();
        }

        const parseNodeFolder = async (browserNode, rigamiNode, parentId) => {
            console.log('parseNodeFolder', browserNode, rigamiNode, parentId);

            let newFolderId;

            if (rigamiNode) {
                console.log('use rigami folder:', rigamiNode);
                newFolderId = rigamiNode.id;
            } else {
                const folder = new Folder({ name: browserNode.title, parentId });
                console.log('create folder:', folder);
                newFolderId = await this.bookmarksService.folders.save({ ...folder }, false);
            }

            await parseLevel(browserNode.children, rigamiNode?.children || [], newFolderId);

            return Promise.resolve();
        };

        const parseLevel = async (browserNodes, rigamiNodes, parentId) => {
            console.log('parseLevel', browserNodes, rigamiNodes);

            const bookmarks = await this.bookmarksService.bookmarks.getAllInFolder(parentId);

            for (let i = 0; i < browserNodes.length; i += 1) {
                if (browserNodes[i].url && !('dateGroupModified' in browserNodes[i])) {
                    await parseNodeBookmark(
                        browserNodes[i],
                        bookmarks.find(({ name, url }) => name === browserNodes[i].title || url === browserNodes[i].url),
                        parentId,
                    );
                } else {
                    await parseNodeFolder(
                        browserNodes[i],
                        rigamiNodes.find(({ name }) => name === browserNodes[i].title),
                        parentId,
                    );
                }
            }
        }

        const tree = await this.bookmarksService.folders.getTree(this.storageService.storage.syncBrowserFolder);


        await chrome.bookmarks.getTree(async (nodes) => {
            await parseLevel(first(nodes).children, tree, this.storageService.storage.syncBrowserFolder);
            console.log('finish sync!');
        });
    }
}

export default SyncSystemBookmarks;
