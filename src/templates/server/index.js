import BackgroundApp from '@/stores/server';
import asyncAction from '@/utils/helpers/asyncAction';
import generateUUID from '@/utils/generate/UUID';
import {
    setUser,
    captureException,
} from '@sentry/browser';
import { StorageConnector } from '@/stores/universal/storage';
import initSentry from '@/config/sentry/server';

initSentry();

asyncAction(async () => {
    let { userId } = await StorageConnector.get('userId', null);

    if (!userId) userId = await StorageConnector.set({ userId: generateUUID() });

    setUser({ id: userId });

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
