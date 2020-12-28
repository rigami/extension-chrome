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
        stream: {
            preloadBGCount: 2,
            preloadMetaCount: 10,
            collections: [
                'EDITORS_СHOICE',
            ],
            queryPresets: [
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
