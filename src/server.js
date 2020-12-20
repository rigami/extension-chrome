import BackgroundApp from '@/stores/server';
import { initBus } from '@/stores/server/bus';
import { DESTINATION } from '@/enum';
import asyncAction from '@/utils/asyncAction';
import { open as openDB } from '@/utils/dbConnector';

console.log('Server app running...');

asyncAction(async () => {
    initBus(DESTINATION.BACKGROUND);
    await openDB();
    new BackgroundApp();
})
    .then(() => console.log('Server app is run!'))
    .catch((e) => console.error('Failed run app server', e));
