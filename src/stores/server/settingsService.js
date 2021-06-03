import { makeAutoObservable } from 'mobx';
import {
    AppSettings,
    WidgetsSettings,
    BackgroundsSettings,
    BookmarksSettings,
} from '@/stores/universal/settings';

class SettingsService {
    settings;
    widgets;
    backgrounds;
    bookmarks;

    constructor(upgrade) {
        makeAutoObservable(this);
        this.settings = new AppSettings(upgrade);
        this.widgets = new WidgetsSettings(upgrade);
        this.backgrounds = new BackgroundsSettings(upgrade);
        this.bookmarks = new BookmarksSettings(upgrade);
    }
}

export default SettingsService;
