import BackgroundApp from '@/stores/server';
import { DESTINATION } from '@/enum';
import asyncAction from '@/utils/helpers/asyncAction';
import initSentry from '@/config/sentry';
import generateUUID from '@/utils/generate/UUID';
import * as Sentry from '@sentry/react';
import { StorageConnector } from '@/stores/universal/storage';

// eslint-disable-next-line no-unused-vars
const manifest = self.__WB_MANIFEST;

initSentry(DESTINATION.BACKGROUND);

asyncAction(async () => {
    let { userId } = await StorageConnector.get('userId', null);

    if (!userId) userId = await StorageConnector.set({ userId: generateUUID() });

    Sentry.setUser({ id: userId });

    await new BackgroundApp().start();
})
    .catch((e) => {
        console.error('Failed run app server', e);
        Sentry.captureException(e);
    });

self.addEventListener('fetch', (event) => {
    console.log('fetch:', event?.request?.url, event);

    event.respondWith(caches.match(event.request).then((response) => response || fetch(event.request)));
});
