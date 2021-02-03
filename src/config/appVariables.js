import { BG_SOURCE, BG_TYPE } from '@/enum';

export default {
    extensionId: chrome.runtime.id,
    db: {
        name: 'rigami',
        version: 5,
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
        fallback: {
            author: "danilkinkin",
            authorAvatarSrc: "https://images.unsplash.com/profile-1607373378133-7e664e90d70cimage?ixlib=rb-1.2.1&q=80&fm=jpg&crop=faces&cs=tinysrgb&fit=crop&h=64&w=64",
            authorName: "Danil Zakhvatkin",
            originId: "nL1pAWmRFYU",
            color: "#0c590c",
            description: "",
            id: "unsplash-nL1pAWmRFYU",
            previewSrc: "https://images.unsplash.com/photo-1607374904945-feef89bffa1f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MXwxODkwMjh8MHwxfGFsbHx8fHx8fHx8&ixlib=rb-1.2.1&q=80&w=400",
            rawSrc: "https://images.unsplash.com/photo-1607374904945-feef89bffa1f?ixid=MXwxODkwMjh8MHwxfGFsbHx8fHx8fHx8&ixlib=rb-1.2.1",
            sourceLink: "https://unsplash.com/photos/nL1pAWmRFYU",
            source: BG_SOURCE.UNSPLASH,
            downloadLink: "https://images.unsplash.com/photo-1607374904945-feef89bffa1f?crop=entropy&cs=srgb&fm=jpg&ixid=MXwxODkwMjh8MHwxfGFsbHx8fHx8fHx8&ixlib=rb-1.2.1&q=85",
            type: BG_TYPE.IMAGE,
        },
        stream: {
            preloadBGCount: 2,
            preloadMetaCount: 10,
            collections: [
                'EDITORS_СHOICE',
            ],
            queryPresets: [
                { id: 'CLOUDS', value: 'Clouds' },
                { id: 'SPACE', value: 'Space' },
                { id: 'NATURE', value: 'Nature' },
                { id: 'MINIMALISM', value: 'Minimalism' },
                { id: 'ABSTRACT', value: 'Abstract' },
                { id: 'NIGHT_SKY', value: 'Night sky' },
                { id: 'WINTER', value: 'Winter' },
                { id: 'WALLPAPER', value: 'Wallpaper' },
                { id: 'DARK', value: 'Dark' },
                { id: 'AESTHETIC', value: 'Aesthetic' },
                { id: 'MINIMALISM_NATURE', value: 'Minimalism nature' },
                { id: 'ARCHITECTURE', value: 'Architecture' },
            ],
        }
    }
};
