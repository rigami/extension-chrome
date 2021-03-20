import { action, makeAutoObservable } from 'mobx';
import { DESTINATION } from '@/enum';
import TagsUniversalService from '@/stores/universal/bookmarks/tags';

class TagsStore {
    _coreService;
    _globalService;

    constructor(coreService, globalService) {
        makeAutoObservable(this);
        this._coreService = coreService;
        this._globalService = globalService;
    }

    @action('save tag')
    async save({ name, id, color }) {
        const newTagId = await TagsUniversalService.save({
            name,
            id,
            color,
        });

        this._coreService.globalEventBus.call('tag/new', DESTINATION.APP, { tagId: newTagId });

        return newTagId;
    }

    @action('remove tag')
    async remove(tagId) {
        const removeBinds = await TagsUniversalService.remove(tagId);

        this._coreService.globalEventBus.call('tag/remove', DESTINATION.APP, { tagId });

        return removeBinds;
    }
}

export default TagsStore;
