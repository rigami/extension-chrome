import { BG_TYPE } from '@/enum';

export default {
    extensionId: chrome.runtime.id,
    db: {
        name: 'rigami',
        version: 2,
    },
    fs: { root: `chrome-extension://${chrome.runtime.id}/persistent/` },
    maxUploadFiles: 15,
    defaultBG: {
        src: `${PRODUCTION_MODE ? 'https://api.rigami.io' : 'http://localhost:8080'}/jeremy-bishop-hVkDaLkoiec-unsplash.jpg`,
        author: 'Jeremy Bishop',
        type: BG_TYPE.IMAGE,
        description: 'Unsplash photo',
        sourceLink: 'https://unsplash.com/photos/hVkDaLkoiec',
    },
    rest: { url: `${PRODUCTION_MODE ? 'https://api.rigami.io' : 'http://localhost:8080'}` },
};
