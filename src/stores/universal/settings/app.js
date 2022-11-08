import { action, computed, makeObservable } from 'mobx';
import { pick } from 'lodash';
import defaultSettings from '@/config/settings';
import settingsStorage from '@/stores/universal/settings/rootSettings';

export const migration = (currState) => ({
    'app.backdropTheme': currState['app.backdropTheme'] || defaultSettings.app.backdropTheme,
    'app.theme': currState['app.theme'] || defaultSettings.app.theme,
    'app.tabName': currState['app.tabName'] || defaultSettings.app.tabName,
    'app.defaultActivity': currState['app.defaultActivity'] || defaultSettings.app.defaultActivity,
    'app.searchRunOnAnyKey': currState['app.searchRunOnAnyKey'] || defaultSettings.app.searchRunOnAnyKey,
});

class AppSettings {
    _storage;

    constructor() {
        makeObservable(this);

        this._storage = settingsStorage;
    }

    @computed
    get backdropTheme() { return this._storage.data['app.backdropTheme']; }

    @computed
    get theme() { return this._storage.data['app.theme']; }

    @computed
    get tabName() { return this._storage.data['app.tabName']; }

    @computed
    get defaultActivity() { return this._storage.data['app.defaultActivity']; }

    @computed
    get searchRunOnAnyKey() { return this._storage.data['app.searchRunOnAnyKey']; }

    @action
    recalc() {
        if ('localStorage' in self) {
            localStorage.setItem('backdropTheme', this.backdropTheme || defaultSettings.app.backdropTheme);
            localStorage.setItem('theme', this.theme || defaultSettings.app.theme);
            localStorage.setItem('tabName', this.tabName);
        }
    }

    @action
    update(props = {}, force = false) {
        const updProps = pick(props, [
            'backdropTheme',
            'theme',
            'tabName',
            'defaultActivity',
            'searchRunOnAnyKey',
        ]);

        this._storage.update('app', updProps, force);
        this.recalc();
    }
}

export default AppSettings;
