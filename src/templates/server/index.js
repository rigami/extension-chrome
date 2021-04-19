import BackgroundApp from '@/stores/server';
import { initBus } from '@/stores/server/bus';
import { DESTINATION } from '@/enum';
import asyncAction from '@/utils/asyncAction';
import { open as openDB } from '@/utils/db';
import initSentry from '@/config/sentry';
import generateUUID from '@/utils/generateUUID';
import * as Sentry from '@sentry/react';
import StorageConnector from '@/utils/storageConnector';
import { captureException } from '@sentry/react';

console.log('Server app running...');
let background;

if (!StorageConnector.getJSON('storage', {}).userId) {
    StorageConnector.setJSON('storage', {
        ...StorageConnector.getJSON('storage', {}),
        userId: generateUUID(),
    });
}

initSentry(DESTINATION.BACKGROUND);

Sentry.setUser({ id: StorageConnector.getJSON('storage', {}).userId });

asyncAction(async () => {
    initBus(DESTINATION.BACKGROUND);
    await openDB();
    // eslint-disable-next-line no-unused-vars
    background = new BackgroundApp();
})
    .then(() => console.log('Server app is run!'))
    .catch((e) => {
        console.error('Failed run app server', e);
        captureException(e);
    });
