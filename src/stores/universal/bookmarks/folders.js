import { action } from 'mobx';
import db from '@/utils/db';
import Folder from '@/stores/universal/bookmarks/entities/folder';
import FavoritesUniversalService from '@/stores/universal/bookmarks/favorites';
import BookmarksUniversalService from '@/stores/universal/bookmarks/bookmarks';

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

        return new Folder(folder);
    }

    @action('save folder')
    static async save({ name, id, parentId }) {
        console.log('universal create folder:', {
            name,
            id,
            parentId,
        });
        let newFolderId = id;

        if (id) {
            await db().put('folders', {
                id,
                name: name.trim(),
                parentId,
            });
        } else {
            newFolderId = await db().add('folders', {
                name: name.trim(),
                parentId,
            });
        }

        return newFolderId;
    }

    @action('remove folder')
    static async remove(folderId) {
        const favoriteItem = FavoritesUniversalService.findFavorite({
            itemType: 'folder',
            itemId: folderId,
        });

        if (favoriteItem) {
            await FavoritesUniversalService.removeFromFavorites(favoriteItem.id);
        }

        const removeFolders = async (parentId) => {
            await db().delete('folders', parentId);

            const removedBookmarks = await BookmarksUniversalService.getAllInFolder(parentId);

            await Promise.all(removedBookmarks.map(({ id }) => BookmarksUniversalService.remove(id)));

            const childFolders = await db().getAllFromIndex(
                'folders',
                'parent_id',
                parentId,
            );

            return [parentId, ...((await Promise.all(childFolders.map(({ id }) => removeFolders(id)))).flat())];
        };

        const removedFolders = await removeFolders(folderId);

        console.log('removedFolders', removedFolders);

        return removedFolders;
    }
}

export default FoldersUniversalService;
