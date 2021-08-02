import { makeAutoObservable } from 'mobx';
import BackgroundsUniversalService from '@/stores/universal/backgrounds/service';
import Background from '@/stores/universal/backgrounds/entities/background';

class SyncBookmarks {
    core;

    constructor(core) {
        makeAutoObservable(this);
        this.core = core;
    }

    async restore(backgrounds, files) {
        console.log('restore backgrounds', backgrounds, files, this.core);

        const localBackgrounds = await BackgroundsUniversalService.getAll();

        console.log('Restore backgrounds...');

        for await (const background of backgrounds) {
            console.log('Check background:', background);
            const computeId = `${background.source.toLowerCase()}-${background.originId}`;
            const findBackground = localBackgrounds.find(({ id }) => computeId === id);

            if (findBackground) {
                console.log(`Background '${computeId}' find in local store. Skip...`);
            } else {
                console.log(`Background '${computeId}' not find in local store. Save as new`);

                console.log('[backgrounds] Added to library...');
                await BackgroundsUniversalService.addToLibrary(new Background({
                    ...background,
                    id: null,
                }));
            }
        }

        console.log('All data restored!');
    }
}

export default SyncBookmarks;
