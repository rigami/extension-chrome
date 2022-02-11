import { computed, makeObservable, override } from 'mobx';
import { pick } from 'lodash';
import PersistentStorage from '../storage/persistent';
import defaultSettings from '@/config/settings';

class WallpapersSettings extends PersistentStorage {
    constructor(upgrade) {
        super('wallpapers', upgrade && ((currState) => ({
            changeInterval: defaultSettings.wallpapers.changeInterval,
            type: defaultSettings.wallpapers.type,
            kind: defaultSettings.wallpapers.kind,
            dimmingPower: defaultSettings.wallpapers.dimmingPower,
            ...(currState || {}),
        })));
        makeObservable(this);
    }

    @computed
    get changeInterval() { return this.data.changeInterval; }

    @computed
    get type() { return this.data.type; }

    @computed
    get kind() { return this.data.kind; }

    @computed
    get dimmingPower() { return this.data.dimmingPower; }

    @override
    update(props = {}) {
        const updProps = pick(props, [
            'changeInterval',
            'type',
            'kind',
            'dimmingPower',
        ]);

        super.update(updProps);
    }
}

export default WallpapersSettings;
