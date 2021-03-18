import { action, makeAutoObservable } from 'mobx';
import DBConnector from '@/utils/dbConnector';
import { DESTINATION } from '@/enum';
import FoldersUniversalService from '@/stores/universal/bookmarks/folders';

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
        this._tags = await DBConnector().getAll('folders');

        return this._tags;
    }

    @action('save folder')
    async save({ name, id, parentId }, pushEvent = true) {
        const newFolderId = await FoldersUniversalService.save({
            name,
            id,
            parentId,
        });

        if (this._coreService && pushEvent) {
            this._coreService.globalEventBus.call('folder/new', DESTINATION.APP, { folderId: newFolderId });
        }

        return newFolderId;
    }

    @action('remove folder')
    async remove(folderId) {
        const removedFolders = await FoldersUniversalService.remove(folderId);

        if (this._coreService) this._coreService.globalEventBus.call('folder/remove', DESTINATION.APP, { folderId });

        return removedFolders;
    }
}

export default FoldersStore;
