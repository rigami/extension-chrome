import { captureException } from '@sentry/browser';
import { cloneDeep } from 'lodash';
import db from '@/utils/db';
import { eventToApp } from '@/stores/universal/serviceBus';
import fetchData from '@/utils/helpers/fetchData';
import { BG_SOURCE } from '@/enum';
import Wallpaper from './entities/wallpaper';
import consoleBinder from '@/utils/console/bind';
import api from '@/utils/helpers/api';

export const ERRORS = {
    TOO_MANY_FILES: 'TOO_MANY_FILES',
    NO_FILES: 'NO_FILES',
    ID_BG_IS_CHANGED: 'ID_BG_IS_CHANGED',
};

const bindConsole = consoleBinder('wallpapers-universal');

class WallpapersUniversalService {
    static FULL_PATH = '/wallpapers/full';
    static PREVIEW_PATH = '/wallpapers/preview';

    static async addToLibrary(saveBG, blobs = {}) {
        console.log('[wallpapers] Add bg to library', saveBG, blobs);

        const urls = await this.fetch(saveBG, blobs);

        console.log('urls:', urls);

        const { url, previewUrl } = urls;
        const savedBG = new Wallpaper({
            ...saveBG,
            isSaved: true,
            fullSrc: url,
            previewSrc: previewUrl,
        });

        console.log('savedBG', savedBG);

        await db().add('backgrounds', cloneDeep(savedBG));

        eventToApp('wallpapers/new', savedBG);

        if (savedBG.source !== BG_SOURCE.USER) {
            api.post(`wallpapers/${savedBG.id}/mark-download`)
                .catch((e) => {
                    console.error(e);
                    captureException(e);
                });
        }

        return savedBG;
    }

    static async removeFromLibrary(removeBG, notRemoveCache = false) {
        console.log('[wallpapers] Remove from store', removeBG);

        try {
            console.log('[wallpapers] Remove from db...');
            await db().delete('backgrounds', removeBG.id);
        } catch (e) {
            console.log(`bg ${removeBG.id} not find in db`);
            captureException(e);
        }

        if (!notRemoveCache) {
            try {
                // TODO: Added remove bg from cache
                console.log('[wallpapers] Remove from file system...');
            } catch (e) {
                console.log(`[backgrounds] BG with id=${removeBG.id} not find in file system`);
                captureException(e);
            }

            eventToApp('wallpapers/removed', removeBG);
        }
    }

    static async fetch(wallpaper, options = {}) {
        const {
            full = true,
            preview = true,
            fullBlob,
            previewBlob,
        } = options;
        const fileName = Date.now().toString();
        bindConsole.log('Fetch wallpaper', {
            wallpaper,
            fileName,
            full,
            preview,
            fullBlob,
            previewBlob,
        });

        let fullBG;
        let previewBG;
        let url;
        let previewUrl;

        const cache = await caches.open('backgrounds');

        try {
            fullBG = fullBlob || (await fetchData(wallpaper.fullSrc, { responseType: 'blob' })).response;
        } catch (e) {
            bindConsole.error('Failed fetch wallpaper', e);
            captureException(e);

            return Promise.reject(e);
        }

        if (preview) {
            try {
                bindConsole.log('Create preview...');

                if (wallpaper.source === BG_SOURCE.USER) {
                    previewUrl = api.computeUrl(`wallpapers/${wallpaper.id}/preview`);
                    previewBG = previewBlob || (await fetchData(wallpaper.previewSrc, { responseType: 'blob' })).response;
                    const previewResponse = new Response(previewBG);

                    await cache.put(previewUrl, previewResponse);
                } else {
                    previewUrl = wallpaper.previewSrc || api.computeUrl(`wallpapers/${wallpaper.id}/preview`);
                    await cache.add(previewUrl);
                }
            } catch (e) {
                bindConsole.warn('Failed create preview:', e);
                captureException(e);
            }
        }

        if (full) {
            bindConsole.log('Save wallpaper in cache...');

            if (wallpaper.source === BG_SOURCE.USER) {
                url = api.computeUrl(`wallpapers/${wallpaper.id}`);
                const fullResponse = new Response(fullBG);
                await cache.put(url, fullResponse);
            } else {
                url = wallpaper.fullSrc;
                await cache.add(url);
            }
        }

        return {
            url,
            previewUrl,
        };
    }

    static async getAll() {
        const bgs = await db().getAll('backgrounds');

        return bgs.map((wallpaper) => new Wallpaper(wallpaper));
    }
}

export default WallpapersUniversalService;
