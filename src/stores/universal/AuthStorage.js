import { PersistentStorage } from '@/stores/universal/storage';

const authStorage = new PersistentStorage(
    'auth',
    ((currState) => ({ ...(currState || {}) })),
);

export default authStorage;
