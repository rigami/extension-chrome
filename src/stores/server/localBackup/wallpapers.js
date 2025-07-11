import { makeAutoObservable } from 'mobx';
import { omit } from 'lodash';
import WallpapersUniversalService from '@/stores/universal/wallpapers/service';
import Wallpaper from '@/stores/universal/wallpapers/entities/wallpaper';
import cacheManager from '@/utils/cacheManager';

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

        for await (const wallpaper of allWallpapers) {
            try {
                const fullBlob = await cacheManager.get('wallpapers', wallpaper.fullSrc)
                    .then((responseRaw) => responseRaw.blob());
                const previewBlob = await cacheManager.get('wallpapers-preview', wallpaper.previewSrc)
                    .then((responseRaw) => responseRaw.blob());
                const ext = fullBlob.type.substring(fullBlob.type.indexOf('/') + 1);

                fullBlobs.set(`${wallpaper.id}.${ext}`, fullBlob);
                previewBlobs.set(`${wallpaper.id}.jpeg`, previewBlob);
            } catch (e) {
                console.warn('Failed download wallpaper:', wallpaper, e);
            }

            meta.push(omit(wallpaper, ['isLoad', 'isSaved']));
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
            const findBackground = localBackgrounds.find(({ id }) => wallpaper.id === id);

            if (findBackground) {
                console.log(`Background '${wallpaper.id}' find in local store. Skip...`);
            } else {
                console.log(`Background '${wallpaper.id}' not find in local store. Save as new`);

                console.log('[wallpapers] Added to library...');
                try {
                    await WallpapersUniversalService.addToLibrary(new Wallpaper(wallpaper), {
                        fullBlob: files[wallpaper.id] || null,
                        previewBlob: previewFiles[wallpaper.id] || null,
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
