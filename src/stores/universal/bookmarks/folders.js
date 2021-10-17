import { action } from 'mobx';
import db from '@/utils/db';
import Folder from '@/stores/universal/bookmarks/entities/folder';
import FavoritesUniversalService from '@/stores/universal/bookmarks/favorites';
import BookmarksUniversalService from '@/stores/universal/bookmarks/bookmarks';
import nowInISO from '@/utils/nowInISO';
import { v4 as UUIDv4 } from 'uuid';

class FoldersUniversalService {
    @action('get folders root')
    static async getFoldersByParent(parentId = 0) {
        const folders = await db().getAllFromIndex('folders', 'parent_id', parentId);

        return folders.map((folder) => new Folder(folder));
    }

    @action('get folders tree')
    static async getTree(parentId = 0) {
        const root = await this.getFoldersByParent(parentId);

        return Promise.all(root.map(async (folder) => {
            const children = await this.getTree(folder.id);

            return new Folder({
                ...folder,
                children,
            });
        }));
    }

    @action('get folders path')
    static async _getPath(folderId = 0, path) {
        const folder = await this.get(folderId);

        if (!folder) return path;

        if (folder.parentId === 0) {
            return [folder, ...path];
        }

        return this._getPath(folder.parentId, [folder, ...path]);
    }

    @action('get folders path')
    static async getPath(folderId = 0) {
        return this._getPath(folderId || 0, []);
    }

    @action('get folder by id')
    static async get(folderId) {
        console.log('get folder by id', folderId);
        const folder = await db().get('folders', folderId);

        return folder && new Folder(folder);
    }

    @action('save folder')
    static async save({ name, id, parentId }, sync = true) {
        const oldFolder = id ? await this.get(id) : {};
        let saveFolderId = id;
        let actionWithBookmark;

        if (id) {
            await db().put('folders', {
                id,
                name: name.trim(),
                parentId,
                createTimestamp: oldFolder.createTimestamp || Date.now(),
                modifiedTimestamp: Date.now(),
            });
            actionWithBookmark = 'update';
        } else {
            saveFolderId = await db().add('folders', {
                id: UUIDv4(),
                name: name.trim(),
                parentId,
                createTimestamp: Date.now(),
                modifiedTimestamp: Date.now(),
            });
            actionWithBookmark = 'create';
        }

        if (sync) {
            // TODO: If only user register
            await db().add('folders_wait_sync', {
                action: actionWithBookmark,
                commitDate: nowInISO(),
                folderId: saveFolderId,
            });
        }

        return saveFolderId;
    }

    @action('remove folder')
    static async remove(folderId, sync = true) {
        if (folderId === 1) return Promise.reject(new Error('Cannon remove first folder'));

        const favoriteItem = FavoritesUniversalService.findFavorite({
            itemType: 'folder',
            itemId: folderId,
        });

        if (favoriteItem) {
            await FavoritesUniversalService.removeFromFavorites(favoriteItem.id);
        }

        const removedBookmarks = await BookmarksUniversalService.getAllInFolder(folderId);

        await Promise.all(removedBookmarks.map(({ id }) => BookmarksUniversalService.remove(id)));

        const childFolders = await db().getAllFromIndex(
            'folders',
            'parent_id',
            folderId,
        );

        await Promise.all(childFolders.map(({ id }) => this.remove(id)));

        await db().delete('folders', folderId);

        if (sync) {
            // TODO: If only enabling sync
            await db().add('folders_wait_sync', {
                action: 'delete',
                commitDate: nowInISO(),
                folderId,
            });
        }

        return Promise.resolve();
    }
}

export default FoldersUniversalService;
