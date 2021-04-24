import { BKMS_VARIANT, TYPE } from '@/enum';
import db from '@/utils/db';
import Bookmark from '@/stores/universal/bookmarks/entities/bookmark';
import Folder from '@/stores/universal/bookmarks/entities/folder';
import { first } from 'lodash';
import { makeAutoObservable } from 'mobx';
import FoldersUniversalService from '@/stores/universal/bookmarks/folders';
import BookmarksUniversalService, { SearchQuery } from '@/stores/universal/bookmarks/bookmarks';
import { captureException } from '@sentry/react';

class SyncChromeBookmarksService {
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
                captureException(e);
            }
            console.log(props, options, callback, other);
            console.log('finish SYNC!');
            // await new Promise((resolve) => setTimeout(resolve, 4500))
            callback();
        });

        if (true || this.core.bookmarksService.settings.syncWithSystem) {
            this.parseSystemBookmarks();

            chrome.bookmarks.onCreated.addListener(async (id, createInfo) => {
                console.log('[chrome bookmarks] Capture create event', id, createInfo);
                /* const bind = await db().getFromIndex(
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
                } */
            });
            chrome.bookmarks.onMoved.addListener((id, moveInfo) => {
                console.log('[chrome bookmarks] Capture move event', id, moveInfo);
            });
            chrome.bookmarks.onChanged.addListener(async (id, changeInfo) => {
                console.log('[chrome bookmarks] Capture change event', id, changeInfo);
            });
            chrome.bookmarks.onRemoved.addListener((id, { node: removedNode, ...removeInfo }) => {
                console.log('[chrome bookmarks] Capture remove event', id, {
                    node: removedNode,
                    removeInfo,
                });
            });
        }
    }

    async createOrUpdateBookmark(browserNode) {
        console.log('[chrome bookmarks] Create or update bookmark:', browserNode);

        const bind = await db().getFromIndex(
            'system_bookmarks',
            'system_id',
            browserNode.id,
        );

        if (!bind) {
            console.log('[chrome bookmarks] Bind not found. Search by parent bind...');

            const parentBind = await db().getFromIndex(
                'system_bookmarks',
                'system_id',
                browserNode.parentId,
            );

            console.log('[chrome bookmarks] parentBind:', parentBind);

            if (!parentBind) return Promise.reject(new Error('Not find folder'));

            const { best: similarBookmarks } = await BookmarksUniversalService.query(new SearchQuery({
                folderId: parentBind.rigamiId,
                query: browserNode.url,
            }));

            console.log('similarBookmarks:', similarBookmarks);
            const similarBookmark = first(similarBookmarks);

            console.log('[chrome bookmarks] Similar rigami bookmarks:', similarBookmark);

            const bookmark = new Bookmark({
                ...(similarBookmark || {}),
                name: browserNode.title,
                url: browserNode.url,
                folderId: parentBind.rigamiId,
                description: '',
                image_url: '',
                icoVariant: BKMS_VARIANT.SYMBOL,
                tags: [],
            });

            const newBookmarkId = await BookmarksUniversalService.save(bookmark);

            await db().add('system_bookmarks', {
                type: TYPE.BOOKMARK,
                rigamiId: newBookmarkId,
                systemId: browserNode.id,
            });
        } else {
            console.log('[chrome bookmarks] Update bookmark...');
        }

        return Promise.resolve();
    }

    async createOrUpdateFolder(browserNode) {
        console.log('[chrome bookmarks] Create or update folder:', browserNode);

        const bind = await db().getFromIndex(
            'system_bookmarks',
            'system_id',
            browserNode.id,
        );

        if (!bind) {
            console.log('[chrome bookmarks] Bind not found. Search by parent bind...');

            const parentBind = await db().getFromIndex(
                'system_bookmarks',
                'system_id',
                browserNode.parentId,
            );

            console.log('[chrome bookmarks] parentBind:', parentBind);

            if (!parentBind && +browserNode.parentId !== 0) return Promise.reject(new Error('Not find parent folder'));

            const folders = await db().getAllFromIndex('folders', 'parent_id', parentBind?.rigamiId || 0);
            const similarFolder = folders.find(({ name }) => name === browserNode.title);

            console.log('[chrome bookmarks] Similar rigami folder:', similarFolder);

            const folder = new Folder({
                ...(similarFolder || {}),
                name: browserNode.title,
                parentId: parentBind?.rigamiId || 0,
            });

            const newFolderId = await FoldersUniversalService.save(folder);

            await db().add('system_bookmarks', {
                type: TYPE.FOLDER,
                rigamiId: newFolderId,
                systemId: browserNode.id,
            });
        } else {
            console.log('[chrome bookmarks] Update folder...');
        }

        return Promise.resolve();
    }

    async parseSystemBookmarks() {
        console.log('[chrome bookmarks] Start parsing...');
        const nodes = await new Promise((resolve) => chrome.bookmarks.getTree(resolve));
        const browserTree = first(nodes).children;

        console.log('[chrome bookmarks] Browser tree:', browserTree);

        const parseBookmarkNode = async (browserBookmarkNode) => {
            await this.createOrUpdateBookmark(browserBookmarkNode);
        };

        const parseFolderNode = async (browserFolderNode) => {
            await this.createOrUpdateFolder(browserFolderNode);

            for await (const browserNode of browserFolderNode.children) {
                await parseNode(browserNode);
            }
        };

        const parseNode = async (browserNode) => {
            if (browserNode.url) {
                await parseBookmarkNode(browserNode);
            } else {
                await parseFolderNode(browserNode);
            }
        };

        for await (const browserNode of browserTree) {
            await parseNode(browserNode);
        }

        console.log('[chrome bookmarks] Finish sync!');
    }
}

export default SyncChromeBookmarksService;
