import DBConnector from '@/utils/dbConnector';
import FSConnector from '@/utils/fsConnector';
import Background from './entities/background';
import createPreview from '@/utils/createPreview';
import { eventToApp } from '@/stores/server/bus';

export const ERRORS = {
    TOO_MANY_FILES: 'TOO_MANY_FILES',
    NO_FILES: 'NO_FILES',
    ID_BG_IS_CHANGED: 'ID_BG_IS_CHANGED',
};

class BackgroundsUniversalService {
    static FULL_PATH = '/backgrounds/full';
    static PREVIEW_PATH = '/backgrounds/preview';

    static async addToLibrary(saveBG) {
        console.log("[backgrounds] Add bg to library", saveBG);

        let saveFileName = saveBG.fileName;

        if (!saveBG.fileName) {
            saveFileName = await this.fetchBG(saveBG.downloadLink);
        }

        const savedBG = new Background({
            ...saveBG,
            isSaved: true,
            id: saveBG.originId,
            fileName: saveFileName,
        });

        console.log('savedBG', savedBG)

        await DBConnector().add('backgrounds', savedBG);

        eventToApp('backgrounds/new', { bg: savedBG });

        return savedBG;
    }

    static async removeFromStore(removeBG) {
        console.log('[backgrounds] Remove from store', removeBG);

        try {
            await DBConnector().delete('backgrounds', removeBG.id);
        } catch (e) {
            console.log(`bg ${removeBG.id} not find in db`)
        }

        console.log('[backgrounds] Remove from db...');

        try {
            await FSConnector.removeFile(`/backgrounds/full/${removeBG.fileName}`);
            await FSConnector.removeFile(`/backgrounds/preview/${removeBG.fileName}`);
        } catch (e) {
            console.log(`[backgrounds] BG with id=${removeBG.id} not find in file system`)
        }
    }

    static async fetchBG(src) {
        const fileName = Date.now().toString();
        console.log('[backgrounds] Fetch BG', { src, fileName });

        const defaultBG = await fetch(src).then((response) => response.blob());

        console.log('[backgrounds] Create preview...');

        const previewDefaultBG = await createPreview(defaultBG);

        console.log('[backgrounds] Save BG in file system...');
        await FSConnector.saveFile(BackgroundsUniversalService.FULL_PATH, defaultBG, fileName);
        await FSConnector.saveFile(BackgroundsUniversalService.PREVIEW_PATH, previewDefaultBG, fileName);

        return fileName;
    }

    static async getAll() {
        const bgs = await DBConnector().getAll('backgrounds');

        return bgs.map((bg) => new Background(bg));
    }
}

export default BackgroundsUniversalService;
