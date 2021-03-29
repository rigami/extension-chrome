import DBConnector from '@/utils/dbConnector';
import fs from '@/utils/fs';
import createPreview from '@/utils/createPreview';
import { eventToApp } from '@/stores/server/bus';
import fetchData from '@/utils/xhrPromise';
import appVariables from '@/config/appVariables';
import { BG_SOURCE } from '@/enum';
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
        let saveFileName = saveBG.fileName;

        if (!saveFileName) {
            saveFileName = await this.fetchBG(saveBG.downloadLink);
        } else {
            const fullBg = await fs().get(`${BackgroundsUniversalService.FULL_PATH}/${saveFileName}`, { type: 'blob' });
            console.log('[backgrounds] Create preview...');

            const previewDefaultBG = await createPreview(fullBg, saveBG.type);

            console.log('[backgrounds] Save preview...');

            await fs().save(`${BackgroundsUniversalService.PREVIEW_PATH}/${saveFileName}`, previewDefaultBG);
        }

        const savedBG = new Background({
            ...saveBG,
            isSaved: true,
            fileName: saveFileName,
        });

        console.log('savedBG', savedBG);

        await DBConnector().add('backgrounds', savedBG);

        eventToApp('backgrounds/new', { bg: savedBG });

        if (savedBG.source !== BG_SOURCE.USER) {
            fetchData(`${appVariables.rest.url}/backgrounds/mark-download/${savedBG.source}/${savedBG.originId}`)
                .catch(console.error);
        }

        return savedBG;
    }

    static async removeFromStore(removeBG) {
        console.log('[backgrounds] Remove from store', removeBG);

        try {
            await DBConnector().delete('backgrounds', removeBG.id);
            console.log('[backgrounds] Remove from db...');
        } catch (e) {
            console.log(`bg ${removeBG.id} not find in db`);
        }

        try {
            await fs().remove(`/backgrounds/full/${removeBG.fileName}`);
            await fs().remove(`/backgrounds/preview/${removeBG.fileName}`);
            console.log('[backgrounds] Remove from file system...');
        } catch (e) {
            console.log(`[backgrounds] BG with id=${removeBG.id} not find in file system`);
        }

        eventToApp('backgrounds/remove', { bg: removeBG });
    }

    static async fetchBG(src, { full = true, preview = true, fileName: defaultFileName } = {}) {
        const fileName = defaultFileName || Date.now().toString();
        console.log('[backgrounds] Fetch background', {
            src,
            fileName,
            full,
            preview,
        });

        let defaultBG;

        try {
            const response = await fetch(src);
            if (!response.ok) throw new Error(response.statusText);
            defaultBG = await response.blob();
        } catch (e) {
            console.error('[backgrounds] Failed fetch bg', e);
            return Promise.reject();
        }

        if (preview) {
            try {
                console.log('[backgrounds] Create preview...');

                const previewDefaultBG = await createPreview(defaultBG);

                await fs().save(`${BackgroundsUniversalService.PREVIEW_PATH}/${fileName}`, previewDefaultBG);
            } catch (e) {
                console.warn('Failed create preview:', e);
            }
        }

        if (full) {
            console.log('[backgrounds] Save BG in file system...');
            await fs().save(`${BackgroundsUniversalService.FULL_PATH}/${fileName}`, defaultBG).catch(console.error);
        }

        return fileName;
    }

    static async getAll() {
        const bgs = await DBConnector().getAll('backgrounds');

        return bgs.map((bg) => new Background(bg));
    }
}

export default BackgroundsUniversalService;
