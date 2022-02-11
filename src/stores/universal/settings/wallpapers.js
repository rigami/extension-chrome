import { computed, makeObservable, override } from 'mobx';
import { mapKeys, pick } from 'lodash';
import PersistentStorage from '../storage/persistent';
import defaultSettings from '@/config/settings';

class WallpapersSettings extends PersistentStorage {
    constructor(upgrade) {
        super('settings', ((currState) => ({
            'wallpapers.changeInterval': defaultSettings.wallpapers.changeInterval,
            'wallpapers.type': defaultSettings.wallpapers.type,
            'wallpapers.kind': defaultSettings.wallpapers.kind,
            'wallpapers.dimmingPower': defaultSettings.wallpapers.dimmingPower,
            ...(currState || {}),
        })));
        makeObservable(this);
    }

    @computed
    get changeInterval() { return this.data['wallpapers.changeInterval']; }

    @computed
    get type() { return this.data['wallpapers.type']; }

    @computed
    get kind() { return this.data['wallpapers.kind']; }

    @computed
    get dimmingPower() { return this.data['wallpapers.dimmingPower']; }

    @override
    update(props = {}) {
        const updProps = pick(props, [
            'changeInterval',
            'type',
            'kind',
            'dimmingPower',
        ]);

        super.update(mapKeys(updProps, (value, key) => `wallpapers.${key}`));
    }
}

export default WallpapersSettings;
