import { makeAutoObservable } from 'mobx';
import consoleBinder from '@/utils/console/bind';
import db from '@/utils/db';

const bindConsole = consoleBinder('wallpapers-local');

class LocalWallpapersService {
    core;
    storage;
    settings;

    constructor(core) {
        makeAutoObservable(this);
        this.core = core;
        this.storage = this.core.storage.persistent;
        this.settings = this.core.settingsService.backgrounds;
    }

    async next() {
        bindConsole.log('Search next from local library...');

        const all = (await Promise.all(this.settings.type.map((type) => (
            db().getAllFromIndex('backgrounds', 'type', type)
        )))).flat();

        if (all.length === 0) {
            return this.core.wallpapersService.set(null);
        }

        const selectedIndex = Math.floor(Math.random() * all.length);

        let wallpaper = all[selectedIndex];

        if (wallpaper.id === this.storage.bgCurrent?.id) {
            if (selectedIndex === 0) {
                wallpaper = all[Math.min(selectedIndex + 1, all.length - 1)];
            } else {
                wallpaper = all[Math.max(selectedIndex - 1, 0)];
            }
        }

        if (wallpaper) return this.core.wallpapersService.set(wallpaper);

        return Promise.resolve();
    }
}

export default LocalWallpapersService;
