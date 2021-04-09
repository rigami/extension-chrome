import { BKMS_VARIANT, TYPE } from '@/enum';
import db from '@/utils/db';
import Bookmark from '@/stores/universal/bookmarks/entities/bookmark';
import Folder from '@/stores/universal/bookmarks/entities/folder';
import { first } from 'lodash';
import { makeAutoObservable } from 'mobx';
import FoldersUniversalService from '@/stores/universal/bookmarks/folders';
import BookmarksUniversalService from '@/stores/universal/bookmarks/bookmarks';

class SyncSystemBookmarksService {
    core;

    constructor(core) {
        makeAutoObservable(this);
        this.core = core;

        if (!chrome?.bookmarks) {
            console.error('Not find bookmarks module');
            return;
        }

        this.core.globalBus.on('system/parseSystemBookmarks', async (props, options, callback, ...other) => {
            try {
                await this.parseSystemBookmarks();
            } catch (e) {
                console.error(e);
            }
            console.log(props, options, callback, other);
            console.log('finish SYNC!');
            // await new Promise((resolve) => setTimeout(resolve, 4500))
            callback();
        });
        if (this.core.bookmarksService.settings.syncWithSystem) {
            this.parseSystemBookmarks();

            chrome.bookmarks.onCreated.addListener(async (id, createInfo) => {
                const bind = await db().getFromIndex(
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
                console.log('onRemoved', id, removeInfo, removedNode);
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

        const bookmarkId = await this.core.bookmarksService.bookmarks.save({
            description: '',
            image_url: '',
            icoVariant: BKMS_VARIANT.SYMBOL,
            ...bookmark,
            tags: [],
        }, notyEvent);

        console.log('add bind:', {
            type: TYPE.BOOKMARK,
            rigamiId: bookmarkId,
            systemId: browserNode.id,
        });

        await db().add('system_bookmarks', {
            type: TYPE.BOOKMARK,
            rigamiId: bookmarkId,
            systemId: browserNode.id,
        });

        return bookmarkId;
    }

    async createFolder(browserNode, parentId, notyEvent = false) {
        const folder = new Folder({
            name: browserNode.title,
            parentId,
        });
        console.log('create folder:', folder);
        const newFolderId = await this.core.bookmarksService.folders.save({ ...folder }, notyEvent);

        console.log('add bind:', {
            type: TYPE.FOLDER,
            rigamiId: newFolderId,
            systemId: browserNode.id,
        });

        await db().add('system_bookmarks', {
            type: TYPE.FOLDER,
            rigamiId: newFolderId,
            systemId: browserNode.id,
        });

        return newFolderId;
    }

    async parseSystemBookmarks() {
        const parseNodeBookmark = async (browserNode, rigamiNode, parentId) => {
            console.log('parseNodeBookmark', browserNode, rigamiNode, parentId);

            if (rigamiNode) {
                console.log('use rigami bookmark:', rigamiNode);
            } else {
                await this.createBookmark(browserNode, parentId);
            }

            return Promise.resolve();
        };

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

            const bookmarks = await BookmarksUniversalService.getAllInFolder(parentId);

            for await (const browserNode of browserNodes) {
                const bind = await db().getFromIndex(
                    'system_bookmarks',
                    'system_id',
                    browserNode.id,
                );

                console.log('bind', bind, browserNode);

                if (browserNode.url && !('dateGroupModified' in browserNode)) {
                    await parseNodeBookmark(
                        browserNode,
                        bookmarks.find(({ name, url, id }) => (
                            id === bind?.rigamiId
                            || name === browserNode.title
                            || url === browserNode.url
                        )),
                        parentId,
                    );
                } else {
                    await parseNodeFolder(
                        browserNode,
                        rigamiNodes.find(({ name, id }) => id === bind?.rigamiId || name === browserNode.title),
                        parentId,
                    );
                }
            }
        };

        const tree = await FoldersUniversalService.getTree(this.core.storageService.storage.syncBrowserFolder);
        const nodes = await new Promise((resolve) => chrome.bookmarks.getTree(resolve));

        await parseLevel(first(nodes).children, tree, this.core.storageService.storage.syncBrowserFolder);
        console.log('finish sync!');
    }
}

export default SyncSystemBookmarksService;
