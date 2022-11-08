import PersistentStorage from './persistent';

const authStorage = new PersistentStorage(
    'auth',
    ((currState) => ({ ...(currState || {}) })),
);

export default authStorage;
