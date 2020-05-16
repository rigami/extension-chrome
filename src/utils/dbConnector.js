import appVariables from '../config/appVariables';
import { openDB } from 'idb';

let _db = null;

const open = () => openDB(appVariables.db.name, appVariables.db.version, {
	upgrade(db) {
		const backgroundsStore = db.createObjectStore('backgrounds', {
			keyPath: 'id',
			autoIncrement: true,
		});
		backgroundsStore.createIndex('type', 'type', { unique: false });
		backgroundsStore.createIndex('author', 'author', { unique: false });
		backgroundsStore.createIndex('source_link', 'sourceLink', { unique: false });
		backgroundsStore.createIndex('file_name', 'fileName', { unique: false });
	},
	blocked() {},
	blocking() {},
	terminated() {},
})
	.then((db) => { _db = db; });

export { open };
export default () => _db;
