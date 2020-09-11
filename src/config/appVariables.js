import { BG_TYPE } from '@/enum';

export default {
    extensionId: 'kiifdbgcimcikhiiapbhadcdcijdbhck',
    db: {
        name: 'clock_tab',
        version: 1,
    },
    fs: { root: chrome.runtime.id && `chrome-extension://${chrome.runtime.id}/persistent/` },
    maxUploadFiles: 15,
    defaultBG: {
        src: `http://${PRODUCTION_MODE ? 'danilkinkin.com' : 'localhost'}:8080/jeremy-bishop-hVkDaLkoiec-unsplash.jpg`,
        author: 'Jeremy Bishop',
        type: BG_TYPE.IMAGE,
        description: 'Unsplash photo',
        sourceLink: 'https://unsplash.com/photos/hVkDaLkoiec',
    },
    rest: { url: `http://${PRODUCTION_MODE ? 'danilkinkin.com' : 'localhost'}:8080` },
};
