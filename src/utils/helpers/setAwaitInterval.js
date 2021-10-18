import asyncAction from '@/utils/helpers/asyncAction';
import { uuid } from '@/utils/generate/uuid';

const intervals = {};

function setAwaitInterval(callback, interval) {
    let timeoutId;

    asyncAction(async () => {
        await callback();
        timeoutId = setTimeout(() => setAwaitInterval(callback, interval), interval);
    });

    const intervalId = uuid();

    intervals[intervalId] = () => { clearTimeout(timeoutId); };

    return intervalId;
}

function stopAwaitInterval(intervalId) {
    if (!(intervalId in intervals)) return;

    intervals[intervalId]();

    delete intervals[intervalId];
}

export default setAwaitInterval;

export {
    setAwaitInterval,
    stopAwaitInterval,
};
