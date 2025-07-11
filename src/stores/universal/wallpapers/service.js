import { captureException } from '@sentry/browser';
import { cloneDeep } from 'lodash';
import db from '@/utils/db';
import { eventToApp } from '@/stores/universal/serviceBus';
import fetchData from '@/utils/helpers/fetchData';
import { BG_SOURCE } from '@/enum';
import Wallpaper from './entities/wallpaper';
import consoleBinder from '@/utils/console/bind';
import api from '@/utils/helpers/api';
import cacheManager from '@/utils/cacheManager';

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

        const urls = await this.fetch(saveBG, {
            ...blobs,
            cacheTime: 'infinity',
        });

        console.log('urls:', urls);

        const { url, previewUrl } = urls;
        const savedBG = new Wallpaper({
            ...saveBG,
            isSaved: true,
            fullSrc: url,
            previewSrc: previewUrl,
        });

        console.log('savedBG', savedBG);

        await db().add('wallpapers', cloneDeep(savedBG));

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
            await db().delete('wallpapers', removeBG.id);
        } catch (e) {
            console.log(`bg ${removeBG.id} not find in db`);
            captureException(e);
        }

        if (!notRemoveCache) {
            try {
                await cacheManager.delete('wallpapers', removeBG.fullSrc);
                await cacheManager.delete('wallpapers-preview', removeBG.previewSrc);

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
            cacheTime = 'temp',
        } = options;
        bindConsole.log('Fetch wallpaper', {
            wallpaper,
            full,
            preview,
            fullBlob,
            previewBlob,
        });

        let url;
        let previewUrl;

        const addedCacheMarker = (rawUrl) => {
            const parsed = new URL(rawUrl);

            parsed.searchParams.set('rigami-cache-scope', 'wallpapers');
            parsed.searchParams.set('rigami-cache-lifetime', cacheTime);

            return `${parsed.origin}${parsed.pathname}?${parsed.searchParams}`;
        };

        if (full) {
            bindConsole.log('Save wallpaper in cache...');

            if (wallpaper.source === BG_SOURCE.USER) {
                url = api.computeUrl(`wallpapers/${wallpaper.id}`);
                url = addedCacheMarker(url);

                await cacheManager.cache('wallpapers', url, fullBlob);
            } else if (fullBlob) {
                url = wallpaper.fullSrc;
                url = addedCacheMarker(url);
                await cacheManager.cache('wallpapers', url, fullBlob);
            } else {
                url = wallpaper.fullSrc;
                url = addedCacheMarker(url);
                await cacheManager.cacheWithPrefetch('wallpapers', url);
            }
        }

        if (preview) {
            try {
                bindConsole.log('Create preview...');

                if (wallpaper.source === BG_SOURCE.USER) {
                    previewUrl = api.computeUrl(`wallpapers/${wallpaper.id}/preview`);
                    previewUrl = addedCacheMarker(previewUrl);

                    await cacheManager.cache('wallpapers-preview', previewUrl, previewBlob);
                } else {
                    previewUrl = wallpaper.previewSrc || api.computeUrl(`wallpapers/${wallpaper.id}/preview`);
                    previewUrl = addedCacheMarker(previewUrl);
                    await cacheManager.cache('wallpapers-preview', previewUrl);
                }
            } catch (e) {
                bindConsole.warn('Failed create preview:', e);
                captureException(e);
            }
        }

        return {
            url,
            previewUrl,
        };
    }

    static async getAll() {
        const bgs = await db().getAll('wallpapers');

        return bgs.map((wallpaper) => new Wallpaper(wallpaper));
    }
}

export default WallpapersUniversalService;
