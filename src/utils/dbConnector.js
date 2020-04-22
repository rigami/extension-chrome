import app_variables from "../config/appVariables";

let _db = null;

/* class IDBValuesRange {
    _values;

    constructor(values) {
        this._values = values;
    }
} */

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

class DBConnectorStore {
    _store;

    constructor(store) {
        this._store = store;
    }

    addItem(value) {
        const result = this._store.add(value);

        return new Promise((resolve, reject) => {
            result.onsuccess = (event) => resolve(event.target.result);

            result.onerror = reject;
        });
    }

    removeItem(key) {
        const result = this._store.delete(key);

        return new Promise((resolve, reject) => {
            result.onsuccess = (event) => resolve(event.target.result);

            result.onerror = reject;
        });
    }

    getItem(key) {
        const result = this._store.get(key);

        return new Promise((resolve, reject) => {
            result.onsuccess = (event) => resolve(event.target.result);

            result.onerror = reject;
        });
    }

    getQuery(dbQuery) {
        const result = this._store.getAllKeys(dbQuery)

        return new Promise((resolve, reject) => {
            result.onsuccess = (event) => {
                console.log("res", event.target.result)
                resolve(event.target.result)
            };

            result.onerror = (e) => reject;
        });
    }

    getMaxPrimaryKey() {
        const result = this._store.openCursor(null, 'prev');

        return new Promise((resolve, reject) => {
            result.onsuccess = (event) => resolve(event.target.result);

            result.onerror = (e) => reject;
        });
    }

    getAllKeys(dbQuery) {
        let index = this._store;

        if (dbQuery && dbQuery._column) index = this._store.index(dbQuery._column);

        return new Promise((resolve, reject) => {
            if (dbQuery && dbQuery._func) {
                const openCursor = index.openCursor();
                const result = [];

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
            } else {
                const result = index.getAllKeys(dbQuery);

                result.onsuccess = (event) => resolve(event.target.result);

                result.onerror = reject;
            }
        });
    }

    getAllItems(dbQuery) {
        if (dbQuery && dbQuery._column) this._store.index(dbQuery._column);
        const result = this._store.getAll(dbQuery && dbQuery._range);

        return new Promise((resolve, reject) => {
            result.onsuccess = (event) => resolve(event.target.result);

            result.onerror = (e) => reject;
        });
    }


    getSize() {
        const result = this._store.count();

        return new Promise((resolve, reject) => {
            result.onsuccess = (event) => resolve(event.target.result);

            result.onerror = (e) => reject;
        });
    }
}

class DBConnector {
    static config(onupgradeneeded) {
        const resultDB = indexedDB.open(app_variables.db.name, app_variables.db.version);

        if (onupgradeneeded) resultDB.onupgradeneeded = (event) => onupgradeneeded(event.target.result);

        return new Promise((resolve, reject) => {
            resultDB.onerror = reject;
            resultDB.onsuccess = (event) => {
                _db = event.target.result;
                resolve(event);
            };
        });
    }

    static get isConfig() {
        return !!_db;
    }

    static getStore(name) {
        return new Promise((resolve, reject) => {
            if (!_db) reject(new Error("DB not configuration yet"));

            const transaction = _db.transaction([name], "readwrite");

            transaction.onerror = reject;

            const store = transaction.objectStore(name);

            resolve(new DBConnectorStore(store));
        });
    }
}

export {DBQuery};

export default DBConnector;