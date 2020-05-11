import { action, observable } from 'mobx';
import StorageConnector from '@/utils/storageConnector';
import { hslToRgb, recomposeColor } from '@material-ui/core/styles/colorManipulator';
import DBConnector from '@/utils/dbConnector'

const categories = [
	...Array.from({ length: 12 }, (e, index) => ({
		id: index,
		title: `Category #${index + 1}`,
		color: hslToRgb(recomposeColor({
			type: 'hsl',
			values: [330 - index * 30, 80, 60],
		})),
	})),
];

const bookmarks = [
	...Array.from({ length: 73 }, (e, index) => ({
		name: index % 3 ? `Пример ссылки #${index + 1}` : `Пример очееень длиного названия ссылки #${index
	+ 1}`,
		description: index % 4
			? index % 3
				? 'Описание ссылки, оно не так сильно выделяется'
				: 'Описание ссылки, оно не так сильно выделяется. Теперь в 2 раза длинее! Ого скажете вы а неет, все норм, это для теста'
			: null,
		src: 'https://website.com',
		icon: null,
		type: Math.random() > 0.5 ? 'extend' : 'default',
		categories: categories.filter(() => Math.random() > 0.75),
	})),
];

class BookmarksStore {
	@observable fapStyle;
	@observable fapPosition;
	@observable openOnStartup;
	@observable categories = [];

	constructor() {
		StorageConnector.getItem('bkms_fap_style')
			.then((value) => { this.fapStyle = value; })
			.catch((e) => console.error(e));

		StorageConnector.getItem('bkms_fap_position')
			.then((value) => { this.fapPosition = value; })
			.catch((e) => console.error(e));

		StorageConnector.getItem('bkms_open_on_startup')
			.then((value) => { this.openOnStartup = value; })
			.catch((e) => console.error(e));

		this._syncCategories();
	}

	@action('set fast access panel style')
	setFAPStyle(style) {
		this.fapStyle = style;

		return StorageConnector.setItem('bkms_fap_style', style);
	}

	@action('set fast access panel position')
	setFAPPosition(position) {
		this.fapPosition = position;

		return StorageConnector.setItem('bkms_fap_position', position);
	}

	@action('set open on startup')
	setOpenOnStartup(position) {
		this.openOnStartup = position;

		return StorageConnector.setItem('bkms_open_on_startup', position);
	}

	@action('sync categories with db')
	_syncCategories() {
		return DBConnector.getStore("categories")
			.then((store) => store.getAllItems())
			.then((value) => { this.categories = value; });
	}

	@action('get category by id')
	getCategory(categoryId) {
		return this.categories.find(({ id }) => id === categoryId);
	}

	@action('add category')
	addCategory(name) {
		let color;

		return DBConnector.getStore("categories")
			.then((store) => {
				return store.getSize()
					.then((size) => {
						color = hslToRgb(recomposeColor({
							type: 'hsl',
							values: [330 - size * 30, 80, 60],
						}));
					})
					.then(() => store);
			})
			.then((store) => store.addItem({
				name,
				color,
			}))
			.then(() => this._syncCategories());
	}

	@action('get bookmarks')
	getBookmarks({ selectCategories = [] } = {}) {
		if (selectCategories.length === 0) return { all: bookmarks };

		const matches = (item) => item.categories.filter((category) => ~selectCategories.indexOf(category.id));

		const result = {};

		if (selectCategories.length > 1) result.best = [];

		bookmarks
			.filter((item) => matches(item).length !== 0)
			.sort((itemA, itemB) => {
				const itemAMatches = matches(itemA).length;
				const itemBMatches = matches(itemB).length;

				if (itemAMatches > itemBMatches) {
					return -1;
				} else if (itemAMatches < itemBMatches) {
					return 1;
				} else {
					return 0;
				}
			})
			.forEach((item) => {
				const match = matches(item);
				if (selectCategories.length !== 1 && match.length === selectCategories.length) {
					result.best = [...(result.best || []), item];
				}

				match.forEach(({ id }) => {
					result[id] = [...(result[id] || []), item];
				});
			});

		return result;
	}
}

export default BookmarksStore;
