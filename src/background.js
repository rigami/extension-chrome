import Background from '@/stores/backgroundApp/background';
import { initBus } from '@/stores/backgroundApp/busApp';
import { DESTINATION } from '@/enum';
import asyncAction from '@/utils/asyncAction';
import { open as openDB } from '@/utils/dbConnector';

console.log('Background is run!');

asyncAction(async () => {
    initBus(DESTINATION.BACKGROUND);
    await openDB();
    return new Background();
});
