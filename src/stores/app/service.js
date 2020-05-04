import { action, observable } from 'mobx';
import StorageConnector from '@/utils/storageConnector';

class AppConfigStore {
	@observable theme;
	@observable backdropTheme;
	@observable useSystemFont;
	@observable tabName;

	constructor() {
		console.error('CREATE');
		StorageConnector.getItem('app_theme')
			.then((value) => { this.theme = value; })
			.catch((e) => console.error(e));

		StorageConnector.getItem('app_backdrop_theme')
			.then((value) => { this.backdropTheme = value; })
			.catch((e) => console.error(e));

		StorageConnector.getJSONItem('app_use_system_font')
			.then((value) => { this.useSystemFont = value; })
			.catch((e) => console.error(e));

		StorageConnector.getItem('app_tab_name')
			.then((value) => {
				this.tabName = value;
				if (document) document.title = value || '\u200E';
			})
			.catch((e) => console.error(e));
	}

	@action('set app theme')
	setTheme(theme) {
		this.theme = theme;

		return StorageConnector.setItem('app_theme', theme);
	}

	@action('set app backdrop theme')
	setBackdropTheme(theme) {
		this.backdropTheme = theme;

		return StorageConnector.setItem('app_backdrop_theme', theme);
	}

	@action('set app usage system font')
	setUsedSystemFont(useSystemFont) {
		this.useSystemFont = useSystemFont;

		return StorageConnector.setJSONItem('app_use_system_font', useSystemFont);
	}

	@action('set app tab name')
	setTabName(tabName, save = true) {
		if (save) this.tabName = tabName;

		if (document) document.title = tabName || '\u200E';

		if (save) {
			return StorageConnector.setItem('app_tab_name', tabName);
		} else {
			return Promise.resolve();
		}
	}
}

export default AppConfigStore;
