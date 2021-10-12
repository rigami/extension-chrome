import { PersistentStorage } from '@/stores/universal/storage';
import { v4 as UUIDv4 } from 'uuid';

const authStorage = new PersistentStorage(
    'auth',
    ((currState) => ({
        deviceToken: UUIDv4(),
        ...(currState || {}),
    })),
);

export default authStorage;
