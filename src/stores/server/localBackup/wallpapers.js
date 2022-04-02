import { makeAutoObservable } from 'mobx';
import { omit } from 'lodash';
import WallpapersUniversalService from '@/stores/universal/wallpapers/service';
import Wallpaper from '@/stores/universal/wallpapers/entities/wallpaper';

class Wallpapers {
    core;

    constructor(core) {
        makeAutoObservable(this);
        this.core = core;
    }

    async collect() {
        const allWallpapers = await WallpapersUniversalService.getAll();

        const meta = [];
        const fullBlobs = new Map();
        const previewBlobs = new Map();
        const cache = await caches.open('wallpapers');

        for await (const wallpaper of allWallpapers) {
            try {
                const fullBlob = await cache.match(wallpaper.fullSrc).then((responseRaw) => responseRaw.blob());
                const previewBlob = await cache.match(wallpaper.previewSrc).then((responseRaw) => responseRaw.blob());
                const ext = fullBlob.type.substring(fullBlob.type.indexOf('/') + 1);

                fullBlobs.set(`${wallpaper.id}.${ext}`, fullBlob);
                previewBlobs.set(`${wallpaper.id}.jpeg`, previewBlob);
            } catch (e) {
                console.warn('Failed download wallpaper:', wallpaper);
            }

            meta.push(omit(wallpaper, [
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

    async restore(wallpapers, files, previewFiles) {
        console.log('restore wallpapers', wallpapers, files, previewFiles, this.core);

        const localBackgrounds = await WallpapersUniversalService.getAll();

        console.log('Restore wallpapers...');

        for await (const wallpaper of wallpapers) {
            console.log('Check wallpaper:', wallpaper);
            const computeId = `${wallpaper.source.toLowerCase()}-${wallpaper.idInSource}`;
            const findBackground = localBackgrounds.find(({ id }) => computeId === id);

            if (findBackground) {
                console.log(`Background '${computeId}' find in local store. Skip...`);
            } else {
                console.log(`Background '${computeId}' not find in local store. Save as new`);

                console.log('[wallpapers] Added to library...');
                try {
                    await WallpapersUniversalService.addToLibrary(new Wallpaper({
                        ...wallpaper,
                        id: null,
                    }), {
                        fullBlob: files[computeId],
                        previewBlob: (computeId in previewFiles) ? previewFiles[computeId] : null,
                    });
                } catch (e) {
                    console.warn('Failed add wallpaper:', e);
                }
            }
        }

        console.log('All data restored!');
    }
}

export default Wallpapers;
