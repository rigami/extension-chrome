import { makeAutoObservable } from 'mobx';
import consoleBinder from '@/utils/console/bind';
import colors from '@/config/colors';

const bindConsole = consoleBinder('wallpapers-local');

class ColorWallpapersService {
    core;
    storage;
    settings;

    constructor(core) {
        makeAutoObservable(this);
        this.core = core;
        this.storage = this.core.storage;
        this.settings = this.core.settingsService.backgrounds;
    }

    async next() {
        bindConsole.log('Search next from color library...');

        const selectedIndex = Math.floor(Math.random() * colors.length);

        let wallpaper = colors[selectedIndex];

        if (wallpaper.id === this.storage.data.bgCurrent?.id) {
            if (selectedIndex === 0) {
                wallpaper = colors[Math.min(selectedIndex + 1, colors.length - 1)];
            } else {
                wallpaper = colors[Math.max(selectedIndex - 1, 0)];
            }
        }

        if (wallpaper) {
            return this.core.wallpapersService.set({
                kind: 'color',
                ...wallpaper,
            });
        }

        return Promise.resolve();
    }
}

export default ColorWallpapersService;
