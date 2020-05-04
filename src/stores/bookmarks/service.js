import { action, observable } from 'mobx';
import StorageConnector from '@/utils/storageConnector';

class AppConfigStore {
	@observable fapStyle;

	constructor() {
		StorageConnector.getItem('bkms_fap_style')
			.then((value) => { this.fapStyle = value; })
			.catch((e) => console.error(e));
	}

	@action('set fast access panel style')
	setFAPStyle(style) {
		this.fapStyle = style;

		return StorageConnector.getItem('bkms_fap_style', style);
	}
}

export default AppConfigStore;
