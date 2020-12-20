import { BG_SOURCE, BG_TYPE } from '@/enum';

export default {
    extensionId: chrome.runtime.id,
    db: {
        name: 'rigami',
        version: 4,
    },
    fs: { root: `chrome-extension://${chrome.runtime.id}/persistent/` },
    maxUploadFiles: 15,
    rest: { url: `${PRODUCTION_MODE ? 'https://api.rigami.io' : 'http://localhost:8080'}` },
    widgets: {
        weather: {
            updateTime: {
                active: 30 * 60 * 1000,
                inactive: 2 * 60 * 60 * 1000,
            },
            services: {
                'openweathermap': {
                    apiKey: '10ad1bca6850a2c26033e31c2a60229f',
                },
                'accuweather': {
                    apiKey: 'va8RX4nd9wx0hDVf6SdnB57tlsfAKA7m',
                }
            },
        },
    },
    backgrounds: {
        radio: {
            preloadBGCount: 2,
            preloadMetaCount: 10,
            queryPresets: [
                "Minimalism",
                "Abstract",
                "Night sky",
                "Winter",
                "Wallpaper",
                "Black",
                "Aesthetic",
                "Minimalism nature",
                "Architecture",
            ],
        }
    }
};
