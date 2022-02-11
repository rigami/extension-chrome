import { computed, makeObservable, override } from 'mobx';
import { mapKeys, pick } from 'lodash';
import PersistentStorage from '../storage/persistent';
import defaultSettings from '@/config/settings';

class DesktopSettings extends PersistentStorage {
    constructor(upgrade) {
        super('settings', ((currState) => ({
            'desktop.fapStyle': defaultSettings.desktop.fapStyle,
            'desktop.fapPosition': defaultSettings.desktop.fapPosition,
            'desktop.fapAlign': defaultSettings.desktop.fapAlign,
            'desktop.useWidgets': defaultSettings.desktop.useWidgets,
            'desktop.widgetsPosition': defaultSettings.desktop.widgetsPosition,
            'desktop.widgetsSize': defaultSettings.desktop.widgetsSize,
            ...(currState || {}),
        })));
        makeObservable(this);
    }

    @computed
    get fapStyle() { return this.data['desktop.fapStyle']; }

    @computed
    get fapPosition() { return this.data['desktop.fapPosition']; }

    @computed
    get fapAlign() { return this.data['desktop.fapAlign']; }

    @computed
    get useWidgets() { return this.data['desktop.useWidgets']; }

    @computed
    get widgetsPosition() { return this.data['desktop.widgetsPosition']; }

    @computed
    get widgetsSize() { return this.data['desktop.widgetsSize']; }

    @override
    update(props = {}) {
        const updProps = pick(props, [
            'fapStyle',
            'fapPosition',
            'fapAlign',
            'useWidgets',
            'widgetsPosition',
            'widgetsSize',
        ]);

        super.update(mapKeys(updProps, (value, key) => `desktop.${key}`));
    }
}

export default DesktopSettings;
