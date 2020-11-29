import { action, makeAutoObservable } from 'mobx';
import { AppSettingsStore } from '@/stores/app/settings';
import WidgetsService from '@/stores/widgets';

class AppStateStore {
    coreService;
    activity = 'desktop';
    settings;
    widgets;

    constructor({ coreService }) {
        makeAutoObservable(this);
        this.coreService = coreService;
        this.settings = new AppSettingsStore();
        this.widgets = new WidgetsService(coreService);
    }

    @action('set activity')
    setActivity(activity) {
        this.activity = activity;
    }
}

export default AppStateStore;
