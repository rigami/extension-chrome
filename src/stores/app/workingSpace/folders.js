import { action, makeAutoObservable } from 'mobx';
import { DESTINATION } from '@/enum';
import FoldersUniversalService from '@/stores/universal/workingSpace/folders';

class FoldersStore {
    _coreService;
    _globalService;

    constructor(coreService, globalService) {
        makeAutoObservable(this);
        this._coreService = coreService;
        this._globalService = globalService;
    }

    @action('save folder')
    async save({ name, id, parentId }) {
        console.log('create folder', {
            name,
            id,
            parentId,
        });

        const newFolderId = await FoldersUniversalService.save({
            name,
            id,
            parentId: parentId || 0,
        });

        this._coreService.globalEventBus.call('folder/new', DESTINATION.APP, { folderId: newFolderId });

        return newFolderId;
    }

    @action('remove folder')
    async remove(folderId) {
        if (folderId === 1) return Promise.reject(new Error('Cannon remove first folder'));

        const removedFolders = await FoldersUniversalService.remove(folderId);

        if (this._coreService) this._coreService.globalEventBus.call('folder/removed', DESTINATION.APP, { folderId });

        return removedFolders;
    }
}

export default FoldersStore;
