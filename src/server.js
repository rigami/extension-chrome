import BackgroundApp from '@/stores/server';
import { initBus } from '@/stores/server/bus';
import { DESTINATION } from '@/enum';
import asyncAction from '@/utils/asyncAction';
import { open as openDB } from '@/utils/dbConnector';

console.log('Server app running...');
let background;

asyncAction(async () => {
    initBus(DESTINATION.BACKGROUND);
    await openDB();
    // eslint-disable-next-line no-unused-vars
    background = new BackgroundApp();
})
    .then(() => console.log('Server app is run!'))
    .catch((e) => console.error('Failed run app server', e));
