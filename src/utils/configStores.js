import createPreview from '@/utils/createPreview';
import appVariables from '@/config/appVariables';
import defaultSettings from '@/config/settings';
import DBConnector from './dbConnector';
import FSConnector from './fsConnector';
import StorageConnector from './storageConnector';

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
			.then(() => StorageConnector.setItem('last_setup_timestamp', Date.now().toString()))
			.then(() => progressCallBack(100));
	}

	static config() {
		return StorageConnector.getItem('last_setup_timestamp')
			.then(() => ConfigStores.configDB(true));
	}

	static configUserData() {
		return DBConnector.getStore('backgrounds')
			.then((store) => store.getAllItems())
			.then((values) => {
				if (values.length !== 0) return Promise.resolve();

				let fullFile;
				let previewFile;
				const fileName = Date.now().toString();

				return fetch(appVariables.defaultBG.src)
					.then((response) => response.blob())
					.then((file) => {
						fullFile = file;
						return createPreview(file);
					})
					.then((preview) => {
						previewFile = preview;
						return FSConnector.saveFile('/backgrounds/full', fullFile, fileName);
					})
					.then(() => FSConnector.saveFile('/backgrounds/preview', previewFile, fileName))
					.then(() => DBConnector.getStore('backgrounds'))
					.then((store) => store.addItem({
						...appVariables.defaultBG,
						fileName,
					}))
					.then((bgId) => StorageConnector.setJSONItem('bg_current', {
						...appVariables.defaultBG,
						fileName,
						id: bgId,
					}));
			});
	}

	static configDB(onlyOpen) {
		return DBConnector.config((db) => {
			if (onlyOpen) throw new Error('Dont permission for upgrade db');

			console.log('Upgrade db version', db);

			const backgroundsStore = db.createObjectStore('backgrounds', {
				keyPath: 'id',
				autoIncrement: true,
			});
			backgroundsStore.createIndex('type', 'type', { unique: false });
			backgroundsStore.createIndex('author', 'author', { unique: false });
			backgroundsStore.createIndex('source_link', 'sourceLink', { unique: false });
			backgroundsStore.createIndex('file_name', 'fileName', { unique: false });
		}).then((r) => console.log('Success connect to db', r));
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
