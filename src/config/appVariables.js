import { BG_SOURCE, BG_TYPE } from '@/enum';
import packageFile from '@/../package.json';
import BrowserAPI from '@/utils/browserAPI';

export default {
    notifyNewVersion: false,
    extensionId: BrowserAPI.extensionId(),
    version: packageFile.version,
    db: {
        name: 'rigami',
        version: 10,
    },
    storage: { version: 1 },
    fs: { root: `chrome-extension://${BrowserAPI.extensionId()}/persistent/` },
    rest: {
        url: PRODUCTION_MODE || PRODUCTION_ENV
            ? 'https://api.rigami.io'
            : 'http://localhost:8080',
    },
    widgets: {
        weather: {
            updateTime: {
                active: 30 * 60 * 1000,
                inactive: 2 * 60 * 60 * 1000,
            },
            services: {
                'openweathermap': { apiKey: '10ad1bca6850a2c26033e31c2a60229f' },
                'accuweather': { apiKey: 'va8RX4nd9wx0hDVf6SdnB57tlsfAKA7m' },
            },
        },
    },
    backup: { version: 5 },
    wallpapers: {
        maxUploadFiles: 15,
        fallback: {
            author: 'danilkinkin',
            authorAvatarSrc: 'https://images.unsplash.com/profile-1607373378133-7e664e90d70cimage?ixlib=rb-1.2.1&q=80&fm=jpg&crop=faces&cs=tinysrgb&fit=crop&h=64&w=64',
            authorName: 'Danil Zakhvatkin',
            idInSource: 'nL1pAWmRFYU',
            color: '#0c590c',
            description: '',
            id: 'unsplash-nL1pAWmRFYU',
            rawSrc: 'https://images.unsplash.com/photo-1607374904945-feef89bffa1f?ixid=MXwxODkwMjh8MHwxfGFsbHx8fHx8fHx8&ixlib=rb-1.2.1',
            sourceLink: 'https://unsplash.com/photos/nL1pAWmRFYU',
            source: BG_SOURCE.UNSPLASH,
            fullSrc: 'https://images.unsplash.com/photo-1607374904945-feef89bffa1f?crop=entropy&cs=srgb&fm=jpg&ixid=MXwxODkwMjh8MHwxfGFsbHx8fHx8fHx8&ixlib=rb-1.2.1&q=85',
            previewSrc: 'https://images.unsplash.com/photo-1607374904945-feef89bffa1f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MXwxODkwMjh8MHwxfGFsbHx8fHx8fHx8&ixlib=rb-1.2.1&q=80&w=400',
            type: BG_TYPE.IMAGE,
        },
        stream: {
            prefetchCount: 5,
            preloadMetaCount: 10,
            collections: ['editor-choice'],
            queryPresets: [
                // 'Clouds',
                // 'Space,'
                'Nature',
                'Minimalism',
                'Abstract',
                'Architecture',
                // 'Night sky,'
                // 'Winter,'
                // 'Wallpaper,'
                // 'Dark,'
                // 'Aesthetic,'
                // 'Minimalism nature,'
            ],
        },
    },
};
