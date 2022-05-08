import { action } from 'mobx';
import db from '@/utils/db';
import Folder from './entities/folder';
import FavoritesUniversalService from './favorites';
import BookmarksUniversalService from './bookmarks';
import { FIRST_UUID, NULL_UUID, uuid } from '@/utils/generate/uuid';

class FoldersUniversalService {
    @action('get folders root')
    static async getFoldersByParent(parentId = NULL_UUID, maxCount) {
        console.log('[folders] [getFoldersByParent] parentId:', parentId);
        const tx = await db().transaction('folders');
        const store = tx.objectStore('folders');
        let folders;

        if (maxCount) {
            folders = await store.index('parent_id').getAll(parentId, maxCount);
        } else {
            folders = await store.index('parent_id').getAll(parentId);
        }

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
    static async save({ name, id, defaultId, parentId }, sync = true) {
        const oldFolder = id ? await this.get(id) : null;
        let saveFolderId = id;

        if (id) {
            await db().put('folders', {
                id,
                name: name.trim(),
                parentId: parentId || null,
                createTimestamp: oldFolder?.createTimestamp || Date.now(),
                modifiedTimestamp: Date.now(),
            });

            const pairRow = await db().get('pair_with_cloud', `folder_${saveFolderId}`);

            if (sync && pairRow) {
                await db().put('pair_with_cloud', {
                    ...pairRow,
                    isSync: +false,
                    modifiedTimestamp: Date.now(),
                });
            }
        } else {
            saveFolderId = await db().add('folders', {
                id: defaultId || uuid(),
                name: name.trim(),
                parentId: parentId || null,
                createTimestamp: Date.now(),
                modifiedTimestamp: Date.now(),
            });
            if (sync) {
                await db().add('pair_with_cloud', {
                    entityType_localId: `folder_${saveFolderId}`,
                    entityType: 'folder',
                    localId: saveFolderId,
                    cloudId: null,
                    isPair: +false,
                    isSync: +false,
                    isDeleted: +false,
                    modifiedTimestamp: Date.now(),
                });
            }
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

        const pairRow = await db().get('pair_with_cloud', `folder_${folderId}`);

        if (sync && pairRow) {
            if (!pairRow.isPair) {
                await db().delete('pair_with_cloud', `folder_${folderId}`);
            } else {
                await db().put('pair_with_cloud', {
                    ...pairRow,
                    isSync: +false,
                    isDeleted: +true,
                    modifiedTimestamp: Date.now(),
                });
            }
        }

        return Promise.resolve();
    }
}

export default FoldersUniversalService;
