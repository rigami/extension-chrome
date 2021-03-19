import {
    action, computed, makeAutoObservable, runInAction,
} from 'mobx';
import { DESTINATION } from '@/enum';
import Tag from '@/stores/universal/bookmarks/entities/tag';
import TagsUniversalService from '@/stores/universal/bookmarks/tags';

class TagsStore {
    _tags = [];
    _coreService;
    _globalService;

    constructor(coreService, globalService) {
        makeAutoObservable(this);
        this._coreService = coreService;
        this._globalService = globalService;

        this._coreService.globalEventBus.on('tag/remove', () => {
            // this._globalService.
        });
    }

    @action('sync tags with db')
    async sync() {
        const tags = await TagsUniversalService.getAll();

        runInAction(() => {
            this._tags = tags;
        });

        return this._tags;
    }

    @computed
    get all() {
        return this._tags;
    }

    @action('get tag by id')
    get(tagId) {
        return new Tag(this._tags.find(({ id }) => id === tagId));
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
