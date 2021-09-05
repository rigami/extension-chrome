import { BKMS_VARIANT } from '@/enum';
import db from '@/utils/db';
import Bookmark from '@/stores/universal/bookmarks/entities/bookmark';
import Folder from '@/stores/universal/bookmarks/entities/folder';
import { makeAutoObservable } from 'mobx';
import { first } from 'lodash';
import FoldersUniversalService from '@/stores/universal/bookmarks/folders';
import BookmarksUniversalService, { SearchQuery } from '@/stores/universal/bookmarks/bookmarks';
import { captureException } from '@sentry/browser';

class SyncChromeBookmarksService {
    core;

    constructor(core) {
        makeAutoObservable(this);
        this.core = core;

        if (!chrome?.bookmarks) {
            console.error('Not find bookmarks module');
            return;
        }

        this.core.globalEventBus.on('system/importSystemBookmarks', async ({ callback }) => {
            try {
                await this.syncBookmarks();
            } catch (e) {
                console.error(e);
                captureException(e);
            }
            callback();
            console.log('finish import!');
        });
    }

    async createOrUpdateBookmark(browserNode, parentId) {
        console.log('[chrome bookmarks] Create or update bookmark:', browserNode, parentId);

        const { best: similarBookmarks } = await BookmarksUniversalService.query(new SearchQuery({
            folderId: parentId,
            query: browserNode.url,
        }));

        console.log('similarBookmarks:', similarBookmarks);
        const similarBookmark = first(similarBookmarks);

        console.log('[chrome bookmarks] Similar rigami bookmarks:', similarBookmark);

        const bookmark = new Bookmark({
            ...(similarBookmark || {}),
            name: browserNode.title,
            url: browserNode.url,
            folderId: parentId,
            description: '',
            image_url: '',
            icoVariant: BKMS_VARIANT.SYMBOL,
            tags: [],
        });

        return BookmarksUniversalService.save(bookmark);
    }

    async createOrUpdateFolder(browserNode, parentId, id) {
        console.log('[chrome bookmarks] Create or update folder:', browserNode, parentId, id);

        let assignFolder = null;

        if (id) {
            assignFolder = await db().get('folders', id);
        }

        if (!assignFolder) {
            const folders = await db().getAllFromIndex('folders', 'parent_id', parentId || 0);
            assignFolder = folders.find(({ name }) => name === browserNode.title);
        }

        const folder = new Folder({
            ...(assignFolder || {}),
            name: browserNode.title || assignFolder.name,
            parentId: parentId || 0,
        });

        return FoldersUniversalService.save(folder);
    }

    async parseSystemBookmarks() {
        console.log('[chrome bookmarks] Start parsing system bookmarks...');
        const nodes = await new Promise((resolve) => chrome.bookmarks.getTree(resolve));
        const [mainNode, ...otherNodes] = first(nodes).children;

        console.log('[chrome bookmarks] Browser tree:', mainNode, otherNodes);

        const parseBookmarkNode = async (browserBookmarkNode, parentId) => {
            await this.createOrUpdateBookmark(browserBookmarkNode, parentId);
        };

        const parseFolderNode = async (browserFolderNode, parentId, id) => {
            const folderId = await this.createOrUpdateFolder(browserFolderNode, parentId, id);

            for await (const browserNode of browserFolderNode.children) {
                await parseNode(browserNode, folderId);
            }
        };

        const parseNode = async (browserNode, parentId, id) => {
            if (browserNode.url) {
                await parseBookmarkNode(browserNode, parentId);
            } else {
                await parseFolderNode(browserNode, parentId, id);
            }
        };

        await parseNode({
            ...mainNode,
            title: null,
        }, 0, 1);

        for await (const browserNode of otherNodes) {
            await parseNode(browserNode, 0);
        }

        console.log('[chrome bookmarks] Finish parsing system bookmarks!');
    }

    async syncBookmarks() {
        console.log('[chrome bookmarks] Start sync with system bookmarks...');
        await this.parseSystemBookmarks();
        console.log('[chrome bookmarks] Finish sync with system bookmarks!');
    }
}

export default SyncChromeBookmarksService;
