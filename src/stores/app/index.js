import { action, makeAutoObservable } from 'mobx';
import { AppSettingsStore } from '@/stores/app/settings';
import WidgetsService from '@/stores/widgets';

class AppStateStore {
    activity = 'desktop';
    settings;
    widgets;

    constructor() {
        makeAutoObservable(this);
        this.settings = new AppSettingsStore();
        this.widgets = new WidgetsService();
    }

    @action('set activity')
    setActivity(activity) {
        this.activity = activity;
    }
}

export default AppStateStore;
