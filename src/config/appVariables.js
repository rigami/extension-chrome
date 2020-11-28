import { BG_TYPE } from '@/enum';

export default {
    extensionId: chrome.runtime.id,
    db: {
        name: 'rigami',
        version: 3,
    },
    fs: { root: `chrome-extension://${chrome.runtime.id}/persistent/` },
    maxUploadFiles: 15,
    defaultBG: {
        src: `${PRODUCTION_MODE ? 'https://api.rigami.io' : 'http://localhost:8080'}/pika-alyani-WajET_vzPmI-unsplash.jpg`,
        author: 'Pika Alyani',
        type: BG_TYPE.IMAGE,
        description: 'Unsplash photo',
        sourceLink: 'https://unsplash.com/photos/WajET_vzPmI',
    },
    rest: { url: `${PRODUCTION_MODE ? 'https://api.rigami.io' : 'http://localhost:8080'}` },
};
