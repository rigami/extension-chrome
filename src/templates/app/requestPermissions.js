import { eventToApp, initBus } from '@/stores/server/bus';
import { DESTINATION } from '@/enum';
import { captureException } from '@sentry/react';

const bus = initBus(DESTINATION.REQUEST_PERMISSIONS);

eventToApp('requestPermissions/ready');

bus.on('requestPermissions/geolocation', async ({ callback }) => {
    console.log('requestPermissions/geolocation');

    try {
        if (!navigator.geolocation) {
            throw new Error('not supported');
        }

        await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));

        callback(true);
    } catch (e) {
        captureException(e);
        callback(false);
    }
});
