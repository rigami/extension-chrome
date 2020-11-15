import { openDB } from 'idb/with-async-ittr.js';
import appVariables from '../config/appVariables';
import dbConfig from '@/config/db';

let _db = null;

const open = () => openDB(appVariables.db.name, appVariables.db.version, dbConfig)
    .then((db) => { _db = db; });

export { open };
export default () => _db;
