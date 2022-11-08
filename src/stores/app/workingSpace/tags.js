import { action, makeAutoObservable } from 'mobx';
import { DESTINATION } from '@/enum';
import TagsUniversalService from '@/stores/universal/workingSpace/tags';

class TagsStore {
    _coreService;
    _globalService;

    constructor(coreService, globalService) {
        makeAutoObservable(this);
        this._coreService = coreService;
        this._globalService = globalService;
    }

    @action('save tag')
    async save(tag) {
        const newTagId = await TagsUniversalService.save(tag);

        this._coreService.globalEventBus.call('tag/new', DESTINATION.APP, { tagId: newTagId });

        return newTagId;
    }

    @action('remove tag')
    async remove(tagId) {
        const removeBinds = await TagsUniversalService.remove(tagId);

        this._coreService.globalEventBus.call('tag/removed', DESTINATION.APP, { tagId });

        return removeBinds;
    }
}

export default TagsStore;
