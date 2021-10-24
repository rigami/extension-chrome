import { action } from 'mobx';
import db from '@/utils/db';
import Folder from '@/stores/universal/bookmarks/entities/folder';
import FavoritesUniversalService from '@/stores/universal/bookmarks/favorites';
import BookmarksUniversalService from '@/stores/universal/bookmarks/bookmarks';
import nowInISO from '@/utils/nowInISO';
import { FIRST_UUID, NULL_UUID, uuid } from '@/utils/generate/uuid';

class FoldersUniversalService {
    @action('get folders root')
    static async getFoldersByParent(parentId = NULL_UUID) {
        console.log('[folders] [getFoldersByParent] parentId:', parentId);
        const folders = await db().getAllFromIndex('folders', 'parent_id', parentId);
        console.log('[folders] [getFoldersByParent] folders:', folders);

        return folders.map((folder) => new Folder(folder));
    }

    @action('get folders tree')
    static async getTree(parentId = NULL_UUID) {
        console.log('[folders] [getTree] parentId:', parentId);
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
    static async _getPath(folderId = null, path) {
        if (!folderId) return path;

        const folder = await this.get(folderId);

        if (!folder) return path;

        if (folder.parentId === NULL_UUID) {
            return [folder, ...path];
        }

        return this._getPath(folder.parentId, [folder, ...path]);
    }

    @action('get folders path')
    static async getPath(folderId = null) {
        return this._getPath(folderId || null, []);
    }

    @action('get folder by id')
    static async get(folderId) {
        console.log('get folder by id', folderId);
        const folder = await db().get('folders', folderId);

        return folder && new Folder(folder);
    }

    @action('save folder')
    static async save({ name, id, parentId }, sync = true) {
        const oldFolder = id ? await this.get(id) : null;
        let saveFolderId = id;
        let actionWithBookmark;

        if (id) {
            await db().put('folders', {
                id,
                name: name.trim(),
                parentId: parentId || null,
                createTimestamp: oldFolder?.createTimestamp || Date.now(),
                modifiedTimestamp: Date.now(),
            });
            actionWithBookmark = 'update';
        } else {
            saveFolderId = await db().add('folders', {
                id: uuid(),
                name: name.trim(),
                parentId: parentId || null,
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
        if (folderId === FIRST_UUID) return Promise.reject(new Error('Cannon remove this folder'));

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
