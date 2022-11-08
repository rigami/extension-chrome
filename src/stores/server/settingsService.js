import { makeAutoObservable } from 'mobx';
import AppSettings from '@/stores/universal/settings/app';
import DesktopSettings from '@/stores/universal/settings/desktop';
import WallpapersSettings from '@/stores/universal/settings/wallpapers';
import WidgetsSettings from '@/stores/universal/settings/widgets';
import WorkingSpaceSettings from '@/stores/universal/settings/workingSpace';
import settingsStorage from '@/stores/universal/settings/rootSettings';

class SettingsService {
    app;
    desktop;
    wallpapers;
    widgets;
    workingSpace;
    settingsStorage;

    constructor() {
        makeAutoObservable(this);

        this.settingsStorage = settingsStorage;
        this.app = new AppSettings();
        this.desktop = new DesktopSettings();
        this.wallpapers = new WallpapersSettings();
        this.widgets = new WidgetsSettings();
        this.workingSpace = new WorkingSpaceSettings();
    }
}

export default SettingsService;
