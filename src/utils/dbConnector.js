import appVariables from '../config/appVariables';

let _db = null;

class DBQuery {
	_column;

	_func;

	constructor(func, column) {
		this._column = column;
		this._func = func;
	}

	static create(func, column) {
		return new DBQuery(func, column);
	}
}

function resultToPromise(result) {
	return new Promise((resolve, reject) => {
		result.onsuccess = (event) => resolve(event.target.result);

		result.onerror = reject;
	});
}

class DBConnectorStore {
	_store;

	constructor(store) {
		this._store = store;
	}

	addItem(value) {
		const result = this._store.add(value);

		return resultToPromise(result);
	}

	removeItem(key) {
		const result = this._store.delete(key);

		return resultToPromise(result);
	}

	getItem(key) {
		const result = this._store.get(key);

		return resultToPromise(result);
	}

	getQuery(dbQuery) {
		const result = this._store.getAllKeys(dbQuery);

		return resultToPromise(result);
	}

	getMaxPrimaryKey() {
		const result = this._store.openCursor(null, 'prev');

		return resultToPromise(result);
	}

	getAllKeys(dbQuery) {
		let index = this._store;

		if (dbQuery && dbQuery._column) index = this._store.index(dbQuery._column);

		if (dbQuery && dbQuery._func) {
			const openCursor = index.openCursor();
			const result = [];

			return new Promise((resolve, reject) => {
				openCursor.onsuccess = (event) => {
					const cursor = event.target.result;
					if (cursor) {
						if (dbQuery._func(cursor.value)) result.push(cursor.value[this._store.keyPath]);

						cursor.continue();
					} else {
						resolve(result);
					}
				};

				openCursor.onerror = reject;
			});
		} else {
			const result = index.getAllKeys(dbQuery);

			return resultToPromise(result);
		}
	}

	getAllItems(dbQuery) {
		if (dbQuery && dbQuery._column) this._store.index(dbQuery._column);
		const result = this._store.getAll(dbQuery && dbQuery._range);

		return resultToPromise(result);
	}


	getSize() {
		const result = this._store.count();

		return resultToPromise(result);
	}
}

class DBConnector {
	static config(onupgradeneeded) {
		const result = indexedDB.open(appVariables.db.name, appVariables.db.version);

		if (onupgradeneeded) result.onupgradeneeded = (event) => onupgradeneeded(event.target.result);

		return resultToPromise(result)
			.then((db) => {
				_db = db;

				return db;
			});
	}

	static get isConfig() {
		return !!_db;
	}

	static getStore(name) {
		return new Promise((resolve, reject) => {
			// if (!_db) reject(new Error('DB not configuration yet'));

			const transaction = _db.transaction([name], 'readwrite');

			transaction.onerror = reject;

			const store = transaction.objectStore(name);

			resolve(new DBConnectorStore(store));
		});
	}
}

export { DBQuery };

export default DBConnector;
