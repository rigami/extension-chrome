import { eventToApp, initBus } from '@/stores/backgroundApp/busApp';
import { DESTINATION } from '@/enum';

const bus = initBus(DESTINATION.REQUEST_PERMISSIONS);

eventToApp('requestPermissions/ready');

bus.on('requestPermissions/geolocation', async ({}, {}, callback) => {
    console.log('requestPermissions/geolocation');

    try {
        if (!navigator.geolocation) {
            throw new Error('not supported');
        }

        await new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject));

        callback(true);
    } catch (e) {
        callback(false);
    }
})
