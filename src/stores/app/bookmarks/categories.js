import { action, computed, makeAutoObservable, runInAction } from 'mobx';
import { DESTINATION } from '@/enum';
import Category from '@/stores/universal/bookmarks/entities/category';
import CategoriesUniversalService from '@/stores/universal/bookmarks/categories';

class CategoriesStore {
    _categories = [];
    _coreService;
    _globalService;

    constructor(coreService, globalService) {
        makeAutoObservable(this);
        this._coreService = coreService;
        this._globalService = globalService;
    }

    @action('sync categories with db')
    async sync() {
        const categories = await CategoriesUniversalService.getAll();

        runInAction(() => {
            this._categories = categories;
        })

        return this._categories;
    }

    @computed
    get all() {
        return this._categories;
    }

    @action('get category by id')
    get(categoryId) {
        return new Category(this._categories.find(({ id }) => id === categoryId));
    }

    @action('save category')
    async save({ name, id, color }) {
        let newCategoryId = await CategoriesUniversalService.save({ name, id, color });

        if (this._coreService) this._coreService.globalEventBus.call('category/new', DESTINATION.APP, { categoryId: newCategoryId });

        return newCategoryId;
    }

    @action('remove category')
    async remove(categoryId) {
        const removeBinds = await CategoriesUniversalService.remove(categoryId);

        if (this._coreService) this._coreService.globalEventBus.call('category/remove', DESTINATION.APP, { categoryId });

        return removeBinds;
    }
}

export default CategoriesStore;
