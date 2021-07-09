import { SERVICE_STATE } from '@/enum';
import { when } from 'mobx';

export default (storage) => new Promise((resolve, rejection) => {
    if (storage.state === SERVICE_STATE.DONE) {
        resolve();
        return;
    } else if (storage.state === SERVICE_STATE.FAILED) {
        rejection();
        return;
    }

    when(() => storage.state === SERVICE_STATE.DONE || storage.state === SERVICE_STATE.FAILED)
        .then(() => {
            if (storage.state === SERVICE_STATE.DONE) {
                resolve();
            } else if (storage.state === SERVICE_STATE.FAILED) {
                rejection();
            }
        });
});
