import { action, observable } from 'mobx';
import { AppSettingsStore } from '@/stores/app/settings';

class AppStateStore {
    @observable activity = 'desktop';
    @observable settings;

    constructor() {
        this.settings = new AppSettingsStore();
    }

    @action('set activity')
    setActivity(activity) {
        this.activity = activity;
    }
}

export default AppStateStore;
