import { PersistentStorage } from '@/stores/universal/storage';
import { uuid } from '@/utils/generate/uuid';

const authStorage = new PersistentStorage(
    'auth',
    ((currState) => ({
        deviceToken: uuid(),
        ...(currState || {}),
    })),
);

export default authStorage;
