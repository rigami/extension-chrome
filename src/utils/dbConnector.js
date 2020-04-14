import app_variables from "../config/appVariables";

let _db = null;

class DbConnectorStore {
    _store;

    constructor(store) {
        console.log(store)
        this._store = store;
    }

    setItem (value){
        const result = this._store.add(value);

        return new Promise((resolve, reject) => {
            result.onsuccess = resolve;

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

    getAllItems (){
        const result = this._store.getAll();

        return new Promise((resolve, reject) => {
            result.onsuccess = (event) => resolve(event.target.result);

            result.onerror = (e) => reject;
        });
    }
}

class DBConnector {
    static config (){
        const resultDB = indexedDB.open(app_variables.db.name, app_variables.db.version);

        resultDB.onupgradeneeded = (event) => {
            console.log("Upgrade db version", event);
            const db = event.target.result;
            
            const backgroundsStore = db.createObjectStore("backgrounds", { keyPath: "id", autoIncremen: true });
            backgroundsStore.createIndex("type", "type", { unique: false });
            backgroundsStore.createIndex("src", "src", { unique: false });
            backgroundsStore.createIndex("author", "author", { unique: false });
            backgroundsStore.createIndex("description", "description", { unique: false });
            backgroundsStore.createIndex("source_link", "source_link", { unique: false });


            backgroundsStore.add({
                id: 1,
                author: "Tim Gouw",
                type: "image",
                preview: "https://images.unsplash.com/photo-1455463640095-c56c5f258548?ixlib=rb-1.2.1&auto=format&fit=crop&w=1349&q=80",
                src: "https://images.unsplash.com/photo-1455463640095-c56c5f258548?ixlib=rb-1.2.1&auto=format&fit=crop&w=1349&q=80",
                description: "Test bg",
                source_link: "https://unsplash.com/photos/S4QAzzXPaRs",
            });
        };

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

            transaction.oncomplete = (e) => {
                console.log(e);
            }

            transaction.onerror = (e) => {
                console.error("Eer", e)
                reject(e);
            };

            const store = transaction.objectStore(name);

            resolve(new DbConnectorStore(store));
        });
    }
}

export default DBConnector;