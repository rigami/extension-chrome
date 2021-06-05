import { SERVICE_STATE } from '@/enum';
import { reaction } from 'mobx';

export default (storage) => new Promise((resolve, rejection) => {
    if (storage.state === SERVICE_STATE.DONE) {
        resolve();
        return;
    } else if (storage.state === SERVICE_STATE.FAILED) {
        rejection();
        return;
    }

    reaction(
        () => storage.state,
        () => {
            if (storage.state === SERVICE_STATE.DONE) {
                resolve();
            } else if (storage.state === SERVICE_STATE.FAILED) {
                rejection();
            }
        },
    );
});
