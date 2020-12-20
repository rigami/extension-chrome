import { openDB } from 'idb/with-async-ittr.js';
import dbConfig, { migrate } from '@/config/db';
import appVariables from '../config/appVariables';

let _db = null;
let migrateRequire = false;

const open = () => openDB(appVariables.db.name, appVariables.db.version, dbConfig({
    upgrade() { migrateRequire = true; }
}))
    .then((db) => { _db = db; })
    .then(async () => { if (migrateRequire) await migrate(appVariables.db.version); });

export { open };
export default () => _db;
