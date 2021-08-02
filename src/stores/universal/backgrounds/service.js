import db from '@/utils/db';
import { eventToApp } from '@/stores/universal/serviceBus';
import fetchData from '@/utils/helpers/fetchData';
import appVariables from '@/config/appVariables';
import { BG_SOURCE } from '@/enum';
import { captureException } from '@sentry/react';
import { cloneDeep } from 'lodash';
import Background from './entities/background';

export const ERRORS = {
    TOO_MANY_FILES: 'TOO_MANY_FILES',
    NO_FILES: 'NO_FILES',
    ID_BG_IS_CHANGED: 'ID_BG_IS_CHANGED',
};

class BackgroundsUniversalService {
    static FULL_PATH = '/backgrounds/full';
    static PREVIEW_PATH = '/backgrounds/preview';

    static async addToLibrary(saveBG) {
        console.log('[backgrounds] Add bg to library', saveBG);

        const urls = await this.fetchBG(saveBG);

        console.log('urls:', urls);

        const { url, previewUrl } = urls;
        const savedBG = new Background({
            ...saveBG,
            isSaved: true,
            fullSrc: url,
            previewSrc: previewUrl,
        });

        console.log('savedBG', savedBG);

        await db().add('backgrounds', cloneDeep(savedBG));

        eventToApp('backgrounds/new', savedBG);

        if (savedBG.source !== BG_SOURCE.USER) {
            fetchData(
                `${appVariables.rest.url}/backgrounds/mark-download/${savedBG.source}/${savedBG.originId}`,
                { responseType: 'raw' },
            )
                .catch((e) => {
                    console.error(e);
                    captureException(e);
                });
        }

        return savedBG;
    }

    static async removeFromLibrary(removeBG, notRemoveCache = false) {
        console.log('[backgrounds] Remove from store', removeBG);

        try {
            console.log('[backgrounds] Remove from db...');
            await db().delete('backgrounds', removeBG.id);
        } catch (e) {
            console.log(`bg ${removeBG.id} not find in db`);
            captureException(e);
        }

        if (!notRemoveCache) {
            try {
                // TODO: Added remove bg from cache
                console.log('[backgrounds] Remove from file system...');
            } catch (e) {
                console.log(`[backgrounds] BG with id=${removeBG.id} not find in file system`);
                captureException(e);
            }

            eventToApp('backgrounds/removed', removeBG);
        }
    }

    static async fetchBG(bg, options = {}) {
        const {
            full = true,
            preview = true,
        } = options;
        const fileName = Date.now().toString();
        console.log('[backgrounds] Fetch background', {
            bg,
            fileName,
            full,
            preview,
        });

        let fullBG;
        let previewBG;
        let url;
        let previewUrl;

        const cache = await caches.open('backgrounds');

        try {
            fullBG = (await fetchData(bg.downloadLink, { responseType: 'blob' })).response;
        } catch (e) {
            console.error('[backgrounds] Failed fetch bg', e);
            captureException(e);
            return Promise.reject();
        }

        if (preview) {
            try {
                console.log('[backgrounds] Create preview...');

                if (bg.source === BG_SOURCE.USER) {
                    previewUrl = `${appVariables.rest.url}/background/user/get-preview?id=${bg.id}`;
                    previewBG = (await fetchData(bg.previewLink, { responseType: 'blob' })).response;
                    const previewResponse = new Response(previewBG);
                    await cache.put(previewUrl, previewResponse);
                } else {
                    previewUrl = bg.previewLink || `${appVariables.rest.url}/background/get-preview?src=${encodeURIComponent(bg.downloadLink)}`;
                    await cache.add(previewUrl);
                }
            } catch (e) {
                console.warn('Failed create preview:', e);
                captureException(e);
            }
        }

        if (full) {
            console.log('[backgrounds] Save BG in file system...');

            if (bg.source === BG_SOURCE.USER) {
                url = `${appVariables.rest.url}/background/user?src=${bg.id}`;
                const fullResponse = new Response(fullBG);
                await cache.put(url, fullResponse);
            } else {
                url = bg.downloadLink;
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

        return bgs.map((bg) => new Background(bg));
    }
}

export default BackgroundsUniversalService;
