import { computed, makeObservable, override } from 'mobx';
import { pick } from 'lodash';
import defaultSettings from '@/config/settings';
import settingsStorage from '@/stores/universal/settings/rootSettings';

export const migration = (currState) => ({
    'wallpapers.changeInterval': currState['wallpapers.changeInterval'] || defaultSettings.wallpapers.changeInterval,
    'wallpapers.type': currState['wallpapers.type'] || defaultSettings.wallpapers.type,
    'wallpapers.kind': currState['wallpapers.kind'] || defaultSettings.wallpapers.kind,
    'wallpapers.dimmingPower': currState['wallpapers.dimmingPower'] || defaultSettings.wallpapers.dimmingPower,
});

class WallpapersSettings {
    _storage;

    constructor() {
        makeObservable(this);

        this._storage = settingsStorage;
    }

    @computed
    get changeInterval() { return this._storage.data['wallpapers.changeInterval']; }

    @computed
    get type() { return this._storage.data['wallpapers.type']; }

    @computed
    get kind() { return this._storage.data['wallpapers.kind']; }

    @computed
    get dimmingPower() { return this._storage.data['wallpapers.dimmingPower']; }

    update(props = {}) {
        const updProps = pick(props, [
            'changeInterval',
            'type',
            'kind',
            'dimmingPower',
        ]);

        this._storage.update('wallpapers', updProps);
    }
}

export default WallpapersSettings;
