import { computed, makeObservable, override } from 'mobx';
import { pick } from 'lodash';
import PersistentStorage from '../storage/persistent';
import defaultSettings from '@/config/settings';

class AppSettings extends PersistentStorage {
    constructor(upgrade) {
        super('app', upgrade && ((currState) => ({
            backdropTheme: defaultSettings.app.backdropTheme,
            theme: defaultSettings.app.theme,
            tabName: defaultSettings.app.tabName,
            defaultActivity: defaultSettings.app.defaultActivity,
            ...(currState || {}),
        })));
        makeObservable(this);
    }

    @computed
    get backdropTheme() { return this.data.backdropTheme; }

    @computed
    get theme() { return this.data.theme; }

    @computed
    get tabName() { return this.data.tabName; }

    @computed
    get defaultActivity() { return this.data.defaultActivity; }

    @override
    update(props = {}) {
        const updProps = pick(props, [
            'backdropTheme',
            'theme',
            'tabName',
            'defaultActivity',
        ]);

        super.update(updProps);

        if ('localStorage' in self) {
            localStorage.setItem('backdropTheme', this.backdropTheme || defaultSettings.app.backdropTheme);
            localStorage.setItem('theme', this.theme || defaultSettings.app.theme);
            localStorage.setItem('tabName', this.tabName);
        }
    }
}

export default AppSettings;
