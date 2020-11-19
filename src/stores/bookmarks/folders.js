import { action, makeAutoObservable } from 'mobx';
import DBConnector from '@/utils/dbConnector';
import { DESTINATION } from '@/enum';
import Folder from './entities/folder';

class FoldersStore {
    _coreService;
    _globalService;

    constructor(coreService, globalService) {
        makeAutoObservable(this);
        this._coreService = coreService;
        this._globalService = globalService;
    }

    @action('sync folders with db')
    async sync() {
        this._categories = await DBConnector().getAll('folders');

        return this._categories;
    }

    @action('get folders root')
    async getFoldersByParent(parentId = 0) {
        const folders = await DBConnector().getAllFromIndex('folders', 'parent_id', parentId);

        return folders.map((folder) => new Folder(folder));
    }

    @action('get folders tree')
    async getTree(parentId = 0) {
        const root = await this.getFoldersByParent(parentId);

        return await Promise.all(root.map(async (folder) => {
            const children = await this.getTree(folder.id);

            return new Folder({ ...folder, children })
        }));
    }

    @action('get folders path')
    async _getPath(parentId = 0, path) {
        const folder = await this.get(parentId);

        if (folder.parentId === 0) {
            return [folder, ...path]
        }

        return await this._getPath(folder.parentId, [folder, ...path]);
    }

    @action('get folders path')
    async getPath(parentId = 0) {
        return await this._getPath(parentId || 0, []);
    }

    @action('get folder by id')
    async get(folderId) {
        const folder = await DBConnector().get('folders', folderId);

        return new Folder(folder);
    }

    @action('save folder')
    async save({ name, id, parentId }) {
        let newFolderId = id;

        if (id) {
            await DBConnector().put('folders', {
                id,
                name: name.trim(),
                parentId,
            });
        } else {
            newFolderId = await DBConnector().add('folders', {
                name: name.trim(),
                parentId,
            });
        }

        if (this._coreService) this._coreService.globalEventBus.call('folder/new', DESTINATION.APP, { folderId: newFolderId });

        return newFolderId;
    }

    @action('remove folder')
    async remove(folderId) {
        await this._globalService.removeFromFavorites({
            type: 'folder',
            id: folderId,
        });

        const removeFolders = async (parentId) => {
            await DBConnector().delete('folders', folderId);

            const childFolders = await DBConnector().getAllFromIndex(
                'folders',
                'parent_id',
                folderId,
            );

            return await Promise.all(childFolders.map(({ id }) => removeFolders(id)));
        }

        const removedFolders = await removeFolders(folderId);

        console.log('removedFolders', removedFolders)

        if (this._coreService) this._coreService.globalEventBus.call('folder/remove', DESTINATION.APP, { folderId });
    }
}

export default FoldersStore;
