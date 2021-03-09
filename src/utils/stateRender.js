import { FETCH } from '@/enum';

export default (state, done, pending, failed, wait) => {
    if (state === FETCH.DONE) {
        return done;
    } else if (state === FETCH.PENDING) {
        return pending;
    } else if (state === FETCH.failed && failed) {
        return failed;
    } else if (state === FETCH.wait && wait) {
        return failed;
    }

    return null;
};
