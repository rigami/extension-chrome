import {
    setUser,
    captureException,
} from '@sentry/browser';
import BackgroundApp from '@/stores/server';
import asyncAction from '@/utils/helpers/asyncAction';
import { uuid } from '@/utils/generate/uuid';

import StorageConnector from '@/stores/universal/storage/connector';
import initSentry from '@/config/sentry/server';

initSentry();

asyncAction(async () => {
    /* const { auth: { deviceToken: defaultDeviceToken } = {} } = await StorageConnector.get('auth', null);

    const deviceToken = defaultDeviceToken || uuid();

    if (!defaultDeviceToken) await StorageConnector.set({ auth: { deviceToken } });

    setUser({ id: deviceToken }); */

    await new BackgroundApp().start();
})
    .catch((e) => {
        console.error('Failed run app server', e);
        captureException(e);
    });

self.addEventListener('fetch', (event) => {
    const headers = event?.request?.headers;

    if (headers && headers.get('pragma') === 'no-cache' && headers.get('cache-control') === 'no-cache') {
        event.respondWith(fetch(event.request));
    } else {
        event.respondWith(caches.match(event.request).then((response) => response || fetch(event.request)));
    }
});
