import {
    setUser,
    captureException,
} from '@sentry/browser';
import BackgroundApp from '@/stores/server';
import asyncAction from '@/utils/helpers/asyncAction';
import { uuid } from '@/utils/generate/uuid';

import StorageConnector from '@/stores/universal/storage/connector';
import initSentry from '@/config/sentry/server';
import config from '@/config/config';
import cacheManager from '@/utils/cacheManager';

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
    const { request } = event;
    const { headers } = request;

    // eslint-disable-next-line no-async-promise-executor
    event.respondWith(new Promise(async (resolve, reject) => {
        if (headers.get('pragma') === 'no-cache' && headers.get('cache-control') === 'no-cache') {
            resolve(fetch(request));
        } else {
            const cache = await caches.match(request);

            if (cache) {
                resolve(cache);
                return;
            }

            resolve(fetch(request));
        }
    }));
});
