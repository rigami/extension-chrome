import { action, observable } from 'mobx';
import StorageConnector from '@/utils/storageConnector';
import { hslToRgb, recomposeColor } from '@material-ui/core/styles/colorManipulator';
import DBConnector from '@/utils/dbConnector';
import { cachingDecorator } from '@/utils/decorators';

const categories = [
	...Array.from({ length: 12 }, (e, index) => ({
		id: index,
		title: `Category #${index + 1}`,
		color: hslToRgb(recomposeColor({
			type: 'hsl',
			values: [330 - index * 340, 80, 60],
		})),
	})),
];

const bookmarks = [
	...Array.from({ length: 73 }, (e, index) => ({
		name: index % 3 ? `Пример ссылки #${index + 1}` : `Пример очееень длиного названия ссылки #${index + 1}`,
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
	@observable lastSearch = null;

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
		return DBConnector().getAll("categories")
			.then((value) => { this.categories = value; });
	}

	@action('get category by id')
	getCategory(categoryId) {
		return this.categories.find(({ id }) => id === categoryId);
	}

	@action('add category')
	addCategory(name) {
		let color;

		return DBConnector().count("categories")
			.then((size) => {
				color = hslToRgb(recomposeColor({
					type: 'hsl',
					values: [330 - size * 30, 80, 60],
				}));
			})
			.then(() => DBConnector().add("categories", {
				name: name.trim(),
				color,
			}))
			.then(() => this._syncCategories());
	}

	@action('search bookmarks')
	async search(searchQuery = {}) {
		this.lastSearch = searchQuery;

		const { categories = [] } = searchQuery;

		const storesName = ['bookmarks_by_categories', 'bookmarks', 'categories'];
		const tx = DBConnector().transaction(storesName, 'readonly');
		const stores = {
			bookmarks_by_categories: tx.objectStore('bookmarks_by_categories'),
			bookmarks: tx.objectStore('bookmarks'),
			categories: tx.objectStore('categories'),
		};

		const getCategory = cachingDecorator((categoryId) => stores.categories.get(categoryId));

		let findBookmarks = {};
		let findCategories = {};
		let findBookmarksByCategories = {};
		let result = [];
		let bestMatches = [];
		let cursor = await stores.bookmarks_by_categories.openCursor();

		let cursorCategoryId;
		let cursorBookmarkId;

		while (cursor) {
			cursorCategoryId = cursor.value.categoryId;
			cursorBookmarkId = cursor.value.bookmarkId;

			if (categories.length === 0 || ~categories.indexOf(cursorCategoryId)) {
				if (!findBookmarks[cursorBookmarkId]) {
					findBookmarks[cursorBookmarkId] = await stores.bookmarks.get(cursorBookmarkId);
				}
				if (!findCategories[cursorCategoryId]) {
					findCategories[cursorCategoryId] = await getCategory(cursorCategoryId);
				}
				findBookmarksByCategories[cursorCategoryId] = [
					...(findBookmarksByCategories[cursorCategoryId] || []),
					findBookmarks[cursorBookmarkId],
				];
			}
			cursor = await cursor.continue();
		}

		for (const bookmarkId in findBookmarks) {
			const index = stores.bookmarks_by_categories.index('bookmark_id');
			let score = 0;

			for await (const cursor of index.iterate(+bookmarkId)) {
				const category = await getCategory(cursor.value.categoryId);

				if (findCategories[category.id]) score++;

				findBookmarks[bookmarkId].categories = [
					...(findBookmarks[bookmarkId].categories || []),
					category,
				];
			}

			if (score === categories.length) {
				bestMatches.push(findBookmarks[bookmarkId]);
			}
		}

		await tx.done;

		for (const categoryId in findCategories) {
			result.push({
				category: findCategories[categoryId],
				bookmarks: findBookmarksByCategories[categoryId],
			});
		}

		if (categories.length > 1) {
			result.unshift({
				category: { name: 'best' },
				bookmarks: bestMatches,
			});
		}

		console.log(result, findBookmarks, findCategories);

		return result;
	}

	@action('add bookmarks')
	addBookmark({ url, name, description, ico_url, categories, type }) {
		return DBConnector().add('bookmarks', {
				url,
				name: name.trim(),
				description: description && description.trim(),
				type,
			})
			.then((bookmarkId) => Promise.all(
				categories.map((categoryId) => DBConnector().add('bookmarks_by_categories', {
					categoryId,
					bookmarkId,
				}))
			));
	}
}

export default BookmarksStore;
