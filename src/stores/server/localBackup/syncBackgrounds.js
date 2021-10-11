import { makeAutoObservable } from 'mobx';
import BackgroundsUniversalService from '@/stores/universal/backgrounds/service';
import Background from '@/stores/universal/backgrounds/entities/background';
import { omit } from 'lodash';

class SyncBackgrounds {
    core;

    constructor(core) {
        makeAutoObservable(this);
        this.core = core;
    }

    async collect() {
        const allBackgrounds = await BackgroundsUniversalService.getAll();

        const meta = [];
        const fullBlobs = new Map();
        const previewBlobs = new Map();
        const cache = await caches.open('backgrounds');

        for await (const background of allBackgrounds) {
            const fullBlob = await cache.match(background.fullSrc).then((responseRaw) => responseRaw.blob());
            const previewBlob = await cache.match(background.previewSrc).then((responseRaw) => responseRaw.blob());
            const ext = fullBlob.type.substring(fullBlob.type.indexOf('/') + 1);

            fullBlobs.set(`${background.id}.${ext}`, fullBlob);
            previewBlobs.set(`${background.id}.jpeg`, previewBlob);

            meta.push(omit(background, [
                'fullSrc',
                'previewSrc',
                'isLoad',
                'isSaved',
                'fileName',
                'id',
            ]));
        }

        return {
            meta: { all: meta },
            full: fullBlobs,
            preview: previewBlobs,
        };
    }

    async restore(backgrounds, files, previewFiles) {
        console.log('restore backgrounds', backgrounds, files, previewFiles, this.core);

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
                try {
                    await BackgroundsUniversalService.addToLibrary(new Background({
                        ...background,
                        id: null,
                    }), {
                        fullBlob: files[computeId],
                        previewBlob: (computeId in previewFiles) ? previewFiles[computeId] : null,
                    });
                } catch (e) {
                    console.warn('Failed add background:', e);
                }
            }
        }

        console.log('All data restored!');
    }
}

export default SyncBackgrounds;
