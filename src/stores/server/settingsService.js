import { makeAutoObservable } from 'mobx';
import AppSettings from '@/stores/universal/settings/app';
import DesktopSettings from '@/stores/universal/settings/desktop';
import WallpapersSettings from '@/stores/universal/settings/wallpapers';
import WidgetsSettings from '@/stores/universal/settings/widgets';
import WorkingSpaceSettings from '@/stores/universal/settings/workingSpace';

class SettingsService {
    app;
    desktop;
    wallpapers;
    widgets;
    workingSpace;

    constructor(upgrade) {
        makeAutoObservable(this);
        this.app = new AppSettings(upgrade);
        this.desktop = new DesktopSettings(upgrade);
        this.wallpapers = new WallpapersSettings(upgrade);
        this.widgets = new WidgetsSettings(upgrade);
        this.workingSpace = new WorkingSpaceSettings(upgrade);
    }
}

export default SettingsService;
