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
    widgets: {
        weather: {
            updateTime: 60 * 60 * 1000,
            services: {
                'openweathermap': {
                    name: 'openweathermap',
                    dashboard: 'https://openweathermap.org/',
                    api: {
                        curr: ({ lat, lon, lang, apiKey }) => `http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&lang=${lang}`,
                    },
                    apiKey: '10ad1bca6850a2c26033e31c2a60229f',
                },
                'accuweather': {
                    name: 'AccuWeather',
                    dashboard: 'http://accuweather.com/',
                    api: {
                        getLocation: ({ lat, lon, apiKey}) => `http://dataservice.accuweather.com/locations/v1/cities/geoposition/search?apiKey=${apiKey}&q${lat},${lon}`,
                        curr: ({ location, lang, apiKey }) => `http://dataservice.accuweather.com/forecasts/v1/hourly/1hour/${location}?apikey=${apiKey}&metric=true&language=${lang}`,
                    },
                    apiKey: 'va8RX4nd9wx0hDVf6SdnB57tlsfAKA7m',
                }
            },
        },
    },
};
