import app_variables from "../config/appVariables";

let _db = null;

class DbConnectorStore {
    _store;

    constructor(store) {
        this._store = store;
    }

    addItem (value){
        const result = this._store.add(value);

        return new Promise((resolve, reject) => {
            result.onsuccess = (event) => resolve(event.target.result);

            result.onerror = reject;
        });
    }

    removeItem (key){
        const result = this._store.delete(key);

        return new Promise((resolve, reject) => {
            result.onsuccess = (event) => resolve(event.target.result);

            result.onerror = reject;
        });
    }

    getItem (key){
        const result = this._store.get(key);

        return new Promise((resolve, reject) => {
            result.onsuccess = (event) => resolve(event.target.result);

            result.onerror = reject;
        });
    }

    getQuery (){
        const result = this._store.getAllKeys(IDBKeyRange.bound(1, 7))

        return new Promise((resolve, reject) => {
            result.onsuccess = (event) => {
                console.log("res", event.target.result)
                resolve(event.target.result)
            };

            result.onerror = (e) => reject;
        });
    }

    getMaxPrimaryKey (){
        const result = this._store.openCursor(null, 'prev');

        return new Promise((resolve, reject) => {
            result.onsuccess = (event) => resolve(event.target.result);

            result.onerror = (e) => reject;
        });
    }

    getAllItems (){
        const result = this._store.getAll();

        return new Promise((resolve, reject) => {
            result.onsuccess = (event) => resolve(event.target.result);

            result.onerror = (e) => reject;
        });
    }


    getSize (){
        const result = this._store.count();

        return new Promise((resolve, reject) => {
            result.onsuccess = (event) => resolve(event.target.result);

            result.onerror = (e) => reject;
        });
    }
}

class DBConnector {
    static config (onupgradeneeded){
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

    static get isConfig (){
        return !!_db;
    }

    static getStore (name){
        return new Promise((resolve, reject) => {
            if (!_db) reject(new Error("DB not configuration yet"));

            const transaction = _db.transaction([name], "readwrite");

            transaction.onerror = reject;

            const store = transaction.objectStore(name);

            resolve(new DbConnectorStore(store));
        });
    }
}

export default DBConnector;