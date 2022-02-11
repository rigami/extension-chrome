import { computed, makeObservable, override } from 'mobx';
import { pick } from 'lodash';
import PersistentStorage from '../storage/persistent';
import defaultSettings from '@/config/settings';

class DesktopSettings extends PersistentStorage {
    constructor(upgrade) {
        super('desktop', upgrade && ((currState) => ({
            fapStyle: defaultSettings.desktop.fapStyle,
            fapPosition: defaultSettings.desktop.fapPosition,
            fapAlign: defaultSettings.desktop.fapAlign,
            useWidgets: defaultSettings.desktop.useWidgets,
            widgetsPosition: defaultSettings.desktop.widgetsPosition,
            widgetsSize: defaultSettings.desktop.widgetsSize,
            ...(currState || {}),
        })));
        makeObservable(this);
    }

    @computed
    get fapStyle() { return this.data.fapStyle; }

    @computed
    get fapPosition() { return this.data.fapPosition; }

    @computed
    get fapAlign() { return this.data.fapAlign; }

    @computed
    get useWidgets() { return this.data.useWidgets; }

    @computed
    get widgetsPosition() { return this.data.widgetsPosition; }

    @computed
    get widgetsSize() { return this.data.widgetsSize; }

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

        super.update(updProps);
    }
}

export default DesktopSettings;
