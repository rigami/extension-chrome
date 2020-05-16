import { action, observable } from 'mobx';
import StorageConnector from '@/utils/storageConnector';
import { hslToRgb, recomposeColor } from '@material-ui/core/styles/colorManipulator';
import DBConnector from '@/utils/dbConnector';
import { cachingDecorator } from '@/utils/decorators';

class BookmarksStore {
	@observable fapStyle;
	@observable fapPosition;
	@observable openOnStartup;
	@observable categories = [];
	@observable lastSearch = null;
	@observable lastTruthSearchTimestamp = null;

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
			.then((id) => {
				return this._syncCategories()
					.then(() => id);
			});
	}

	@action('search bookmarks')
	async search(searchQuery = {}) {
		this.lastSearch = searchQuery;
		this.lastTruthSearchTimestamp = Date.now();

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

		if (categories.length > 1 && result.length !== 0) {
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
			))
			.then(() => {
				this.lastTruthSearchTimestamp = Date.now();
			});
	}
}

export default BookmarksStore;
