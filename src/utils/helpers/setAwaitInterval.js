import asyncAction from '@/utils/helpers/asyncAction';

function setAwaitInterval(callback, interval) {
    asyncAction(async () => {
        await callback();
        setTimeout(() => setAwaitInterval(callback, interval), interval);
    });
}

export default setAwaitInterval;
