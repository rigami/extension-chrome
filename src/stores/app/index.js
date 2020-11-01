import { action, makeAutoObservable } from 'mobx';
import { AppSettingsStore } from '@/stores/app/settings';

class AppStateStore {
    activity = 'desktop';
    settings;

    constructor() {
        makeAutoObservable(this);
        this.settings = new AppSettingsStore();
    }

    @action('set activity')
    setActivity(activity) {
        this.activity = activity;
    }
}

export default AppStateStore;
