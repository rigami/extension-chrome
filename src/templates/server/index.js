import BackgroundApp from '@/stores/server';
import asyncAction from '@/utils/helpers/asyncAction';
import { v4 as UUIDv4 } from 'uuid';
import {
    setUser,
    captureException,
} from '@sentry/browser';
import { StorageConnector } from '@/stores/universal/storage';
import initSentry from '@/config/sentry/server';

initSentry();

asyncAction(async () => {
    const { auth: { deviceToken: defaultDeviceToken } = {} } = await StorageConnector.get('auth', null);

    const deviceToken = defaultDeviceToken || UUIDv4();

    if (!defaultDeviceToken) await StorageConnector.set({ auth: { deviceToken } });

    setUser({ id: deviceToken });

    await new BackgroundApp().start();
})
    .catch((e) => {
        console.error('Failed run app server', e);
        captureException(e);
    });

self.addEventListener('fetch', (event) => {
    console.log('fetch:', event?.request?.url, event);

    event.respondWith(caches.match(event.request).then((response) => response || fetch(event.request)));
});
