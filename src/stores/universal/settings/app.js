import { computed, makeObservable, override } from 'mobx';
import { mapKeys, pick } from 'lodash';
import PersistentStorage from '../storage/persistent';
import defaultSettings from '@/config/settings';

class AppSettings extends PersistentStorage {
    constructor(upgrade) {
        super('settings', ((currState) => ({
            'app.backdropTheme': defaultSettings.app.backdropTheme,
            'app.theme': defaultSettings.app.theme,
            'app.tabName': defaultSettings.app.tabName,
            'app.defaultActivity': defaultSettings.app.defaultActivity,
            ...(currState || {}),
        })));
        makeObservable(this);
    }

    @computed
    get backdropTheme() { return this.data['app.backdropTheme']; }

    @computed
    get theme() { return this.data['app.theme']; }

    @computed
    get tabName() { return this.data['app.tabName']; }

    @computed
    get defaultActivity() { return this.data['app.defaultActivity']; }

    @override
    update(props = {}) {
        const updProps = pick(props, [
            'backdropTheme',
            'theme',
            'tabName',
            'defaultActivity',
        ]);

        super.update(mapKeys(updProps, (value, key) => `app.${key}`));

        if ('localStorage' in self) {
            localStorage.setItem('backdropTheme', this.backdropTheme || defaultSettings.app.backdropTheme);
            localStorage.setItem('theme', this.theme || defaultSettings.app.theme);
            localStorage.setItem('tabName', this.tabName);
        }
    }
}

export default AppSettings;
