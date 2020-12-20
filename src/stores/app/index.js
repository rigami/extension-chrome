import { action, makeAutoObservable } from 'mobx';
import { AppSettingsStore } from '@/stores/app/settings';
import WidgetsService from '@/stores/app/widgets';
import BackgroundsService from '@/stores/app/backgrounds';

class AppStateStore {
    coreService;
    activity = 'desktop';
    settings;
    widgets;
    backgrounds;

    constructor({ coreService }) {
        makeAutoObservable(this);
        this.coreService = coreService;
        this.settings = new AppSettingsStore();
        this.widgets = new WidgetsService(coreService);
        this.backgrounds = new BackgroundsService(coreService);
    }

    @action('set activity')
    setActivity(activity) {
        this.activity = activity;
    }
}

export default AppStateStore;
