import { computed, makeObservable, override } from 'mobx';
import { pick } from 'lodash';
import defaultSettings from '@/config/settings';
import settingsStorage from '@/stores/universal/settings/rootSettings';

export const migration = (currState) => ({
    'desktop.fapStyle': currState['desktop.fapStyle'] || defaultSettings.desktop.fapStyle,
    'desktop.fapPosition': currState['desktop.fapPosition'] || defaultSettings.desktop.fapPosition,
    'desktop.fapAlign': currState['desktop.fapAlign'] || defaultSettings.desktop.fapAlign,
    'desktop.useWidgets': currState['desktop.useWidgets'] || defaultSettings.desktop.useWidgets,
    'desktop.widgetsPosition': currState['desktop.widgetsPosition'] || defaultSettings.desktop.widgetsPosition,
    'desktop.widgetsSize': currState['desktop.widgetsSize'] || defaultSettings.desktop.widgetsSize,
});

class DesktopSettings {
    _storage;

    constructor() {
        makeObservable(this);

        this._storage = settingsStorage;
    }

    @computed
    get fapStyle() { return this._storage.data['desktop.fapStyle']; }

    @computed
    get fapPosition() { return this._storage.data['desktop.fapPosition']; }

    @computed
    get fapAlign() { return this._storage.data['desktop.fapAlign']; }

    @computed
    get useWidgets() { return this._storage.data['desktop.useWidgets']; }

    @computed
    get widgetsPosition() { return this._storage.data['desktop.widgetsPosition']; }

    @computed
    get widgetsSize() { return this._storage.data['desktop.widgetsSize']; }

    update(props = {}) {
        const updProps = pick(props, [
            'fapStyle',
            'fapPosition',
            'fapAlign',
            'useWidgets',
            'widgetsPosition',
            'widgetsSize',
        ]);

        this._storage.update('desktop', updProps);
    }
}

export default DesktopSettings;
