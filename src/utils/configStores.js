import createPreview from '@/utils/createPreview';
import appVariables from '@/config/appVariables';
import defaultSettings from '@/config/settings';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import { initBus } from '@/stores/backgroundApp/busApp';
import { DESTINATION } from '@/enum';
import StorageConnector from './storageConnector';
import FSConnector from './fsConnector';
import DBConnector, { open as openDB } from './dbConnector';

class ConfigStores {
    static setup(progressCallBack) {
        return ConfigStores.configDB()
            .then(() => progressCallBack(5))
            .then(() => ConfigStores.configFS())
            .then(() => progressCallBack(10))
            .then(() => ConfigStores.configUserData((progressValue) => progressCallBack(10 + progressValue * 0.8)))
            .then(() => StorageConnector.setItem('bg_selection_method', defaultSettings.backgrounds.selection_method))
            .then(() => StorageConnector.setJSONItem('bg_type', defaultSettings.backgrounds.bg_type))
            .then(() => StorageConnector.setItem('bg_change_interval', defaultSettings.backgrounds.change_interval))
            .then(() => StorageConnector.setItem('bg_dimming_power', defaultSettings.backgrounds.dimming_power))
            .then(() => StorageConnector.setItem('app_theme', defaultSettings.app.theme))
            .then(() => StorageConnector.setItem('app_backdrop_theme', defaultSettings.app.backdropTheme))
            .then(() => StorageConnector.setJSONItem('app_use_system_font', defaultSettings.app.useSystemFont))
            .then(() => StorageConnector.setItem('app_tab_name', defaultSettings.app.tabName))
            .then(() => StorageConnector.setItem('bkms_fap_style', defaultSettings.bookmarks.fapStyle))
            .then(() => StorageConnector.setItem('bkms_fap_position', defaultSettings.bookmarks.fapPosition))
            .then(() => StorageConnector.setItem('bkms_open_on_startup', defaultSettings.bookmarks.openOnStartup))
            .then(() => StorageConnector.setJSONItem('bkms_favorites', defaultSettings.bookmarks.favorites))
            .then(() => StorageConnector.setJSONItem('bkms_sync_with_system', defaultSettings.bookmarks.syncWithSystem))
            .then(() => StorageConnector.setJSONItem('bkms_favorites', defaultSettings.bookmarks.favorites))
            .then(() => StorageConnector.setItem('last_setup_timestamp', Date.now().toString()))
            .then(() => progressCallBack(100));
    }

    static async config() {
        initBus(DESTINATION.APP);

        await i18n
            .use(LanguageDetector)
            .use(initReactI18next)
            .use(Backend)
            .init({
                fallbackLng: PRODUCTION_MODE ? 'en' : 'dev',
                debug: true,
                interpolation: { escapeValue: false },
                backend: { loadPath: 'resource/i18n/{{lng}}.json' },
            });

        await StorageConnector.getItem('last_setup_timestamp');
        await ConfigStores.configDB();
    }

    static async configUserData() {
        const backgrounds = await DBConnector().getAll('backgrounds');

        if (backgrounds.length !== 0) return Promise.resolve();

        const fileName = Date.now().toString();

        const defaultBG = await fetch(appVariables.defaultBG.src).then((response) => response.blob());
        const previewDefaultBG = await createPreview(defaultBG);

        await FSConnector.saveFile('/backgrounds/full', defaultBG, fileName);
        await FSConnector.saveFile('/backgrounds/preview', previewDefaultBG, fileName);

        const bgId = await DBConnector().add('backgrounds', {
            ...appVariables.defaultBG,
            fileName,
        });

        await StorageConnector.setJSONItem('bg_current', {
            ...appVariables.defaultBG,
            fileName,
            id: bgId,
        });
    }

    static configDB() {
        return openDB()
            .then(() => console.log('Success connect to db'));
    }

    static configFS() {
        return FSConnector.getPath('/')
            .then((rootFS) => rootFS.createPath('bookmarksIcons')
                .then(() => rootFS))
            .then((rootFS) => rootFS.createPath('backgrounds'))
            .then((backgroundsFS) => backgroundsFS.createPath('full')
                .then(() => backgroundsFS.createPath('preview')))
            .then(() => console.log('Success create fs'));
    }
}

export default ConfigStores;
