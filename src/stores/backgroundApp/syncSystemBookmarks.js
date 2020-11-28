import { BKMS_VARIANT, TYPE } from '@/enum';
import DBConnector from '@/utils/dbConnector';
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

        this.bus.on('system/parseSystemBookmarks', async (props, options, callback, ...other) => {
            await this.parseSystemBookmarks();
            console.log(props, options, callback, other)
            console.log('finish SYNC!')
            // await new Promise((resolve) => setTimeout(resolve, 4500))
            callback();
        });
        if (this.bookmarksService.settings.syncWithSystem) {
            this.parseSystemBookmarks();

            chrome.bookmarks.onCreated.addListener(async (id, createInfo) => {
                const bind = await DBConnector().getFromIndex(
                    'system_bookmarks',
                    'system_id',
                    createInfo.parentId,
                );

                if (createInfo.url && !('dateGroupModified' in createInfo)) {
                    console.log('onCreated bookmark', id, createInfo, bind);
                    await this.createBookmark(createInfo, bind.rigamiId, true);
                } else {
                    console.log('onCreated folder', id, createInfo);
                    await this.createFolder(createInfo, bind.rigamiId, true);
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

    async createBookmark(browserNode, parentId, notyEvent = false) {
        const bookmark = new Bookmark({
            name: browserNode.title,
            url: browserNode.url,
            folderId: parentId,
        });

        console.log('create bookmark:', bookmark);

        const bookmarkId = await this.bookmarksService.bookmarks.save({
            description: '',
            image_url: '',
            icoVariant: BKMS_VARIANT.SYMBOL,
            ...bookmark,
            categories: [],
        }, notyEvent);

        await DBConnector().add('system_bookmarks', {
            type: TYPE.BOOKMARK,
            rigamiId: bookmarkId,
            systemId: browserNode.id,
        });

        return bookmarkId;
    }

    async createFolder(browserNode, parentId, notyEvent = false) {
        const folder = new Folder({ name: browserNode.title, parentId });
        console.log('create folder:', folder);
        const newFolderId = await this.bookmarksService.folders.save({ ...folder }, notyEvent);

        await DBConnector().add('system_bookmarks', {
            type: TYPE.FOLDER,
            rigamiId: newFolderId,
            systemId: browserNode.id,
        });

        return newFolderId;
    }

    async parseSystemBookmarks() {
        const db = DBConnector();

        const parseNodeBookmark = async (browserNode, rigamiNode, parentId) => {
            console.log('parseNodeBookmark', browserNode, rigamiNode, parentId);

            if (rigamiNode) {
                console.log('use rigami bookmark:', rigamiNode);
            } else {
                await this.createBookmark(browserNode, parentId);
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
                newFolderId = await this.createFolder(browserNode, parentId);
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
        const nodes = await new Promise((resolve) => chrome.bookmarks.getTree(resolve));

        await parseLevel(first(nodes).children, tree, this.storageService.storage.syncBrowserFolder);
        console.log('finish sync!');
    }
}

export default SyncSystemBookmarks;
