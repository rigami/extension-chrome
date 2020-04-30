import { action, observable } from 'mobx';
import StorageConnector from '@/utils/storageConnector';

class AppConfigStore {
	@observable theme;
	@observable backdropTheme;
	@observable tabName;
	_onChangeTheme;

	constructor() {
		StorageConnector.getItem('app_theme')
			.then((value) => { this.theme = value; })
			.catch((e) => console.error(e));

		StorageConnector.getItem('app_backdrop_theme')
			.then((value) => { this.backdropTheme = value; })
			.catch((e) => console.error(e));

		StorageConnector.getItem('app_tab_name')
			.then((value) => { this.tabName = value; })
			.catch((e) => console.error(e));
	}

	@action('set app theme')
	setTheme(theme) {
		this.theme = theme;

		return StorageConnector.setItem('app_theme', theme)
			.then(() => {
				if (this._onChangeTheme) this._onChangeTheme();
			});
	}

	@action('set app backdrop theme')
	setBackdropTheme(theme) {
		this.backdropTheme = theme;

		return StorageConnector.setItem('app_backdrop_theme', theme);
	}

	@action('set app tab name')
	setTabName(tabName) {
		this.tabName = tabName;

		if (document) document.title = tabName || '\u200E';

		return StorageConnector.setItem('app_tab_name', tabName);
	}
}

export default AppConfigStore;
