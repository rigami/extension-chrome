import { action, observable, computed } from 'mobx';
import DBConnector from '@/utils/dbConnector';
import EventBus from '@/utils/eventBus';
import getUniqueColor from "@/utils/uniqueColor";
import BusApp from "@/stores/backgroundApp/busApp";
import {DESTINATION} from "@/enum";

class CategoriesStore {
    @observable _categories = [];
    eventBus;
    bus;

    constructor() {
        this.eventBus = new EventBus();
        this.bus = BusApp();
    }

    @action('sync categories with db')
    async sync() {
        this._categories = await DBConnector().getAll('categories');
    }

    @computed
    get all() {
        return this._categories;
    }

    @action('get category by id')
    get(categoryId) {
        return this._categories.find(({ id }) => id === categoryId);
    }

    @action('save category')
    async save({ name, id, color }) {
        let newColor;

        if (!id) {
            const countCategories = await DBConnector().count('categories')
            newColor = color || getUniqueColor(countCategories);
        } else {
            newColor = color || this.get(id).color;
        }

        const similarCategory = await DBConnector().getFromIndex('categories', 'name', name.trim());

        if (similarCategory?.id !== id) {
            return similarCategory?.id;
        }

        let newCategoryId = id;

        if (id) {
            await DBConnector().put('categories', {
                id,
                name: name.trim(),
                color: newColor,
            });
        } else {
            newCategoryId = await DBConnector().add('categories', {
                name: name.trim(),
                color: newColor,
            });
        }

        this.bus.call('category/new', DESTINATION.APP, { categoryId: newCategoryId });

        return newCategoryId;
    }

    @action('remove category')
    async remove(categoryId) {
        await DBConnector().delete('categories', categoryId);

        const removeBinds = await DBConnector().getAllFromIndex(
            'bookmarks_by_categories',
            'category_id',
            categoryId,
        );

        await Promise.all(removeBinds.map(({ id }) => DBConnector().delete('bookmarks_by_categories', id)));

        this.bus.call('category/remove', DESTINATION.APP, { categoryId });
    }
}

export default CategoriesStore;
