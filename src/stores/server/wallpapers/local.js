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

    async getRandom(sources = []) {
        console.log('this.settings.type:', this.settings.type);
        const all = (await Promise.all(this.settings.type.map((type) => (
            db()
                .getAllFromIndex('backgrounds', 'type', type)
        )))).flat().filter(({ source }) => {
            if (sources.length === 0) return true;

            return sources.includes(source);
        });

        console.log('all:', all);

        if (all.length === 0) return null;

        const selectedIndex = Math.floor(Math.random() * all.length);

        let wallpaper = all[selectedIndex];

        if (wallpaper.id === this.storage.data.bgCurrent?.id) {
            if (selectedIndex === 0) {
                wallpaper = all[Math.min(selectedIndex + 1, all.length - 1)];
            } else {
                wallpaper = all[Math.max(selectedIndex - 1, 0)];
            }
        }

        return wallpaper;
    }

    async next() {
        bindConsole.log('Search next from local library...');

        const wallpaper = await this.getRandom();

        return this.core.wallpapersService.set(wallpaper);
    }
}

export default LocalWallpapersService;
