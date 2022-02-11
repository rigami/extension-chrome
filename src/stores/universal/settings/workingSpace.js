import { computed, makeObservable, override } from 'mobx';
import { mapKeys, pick } from 'lodash';
import PersistentStorage from '../storage/persistent';
import defaultSettings from '@/config/settings';

class WorkingSpaceSettings extends PersistentStorage {
    constructor(upgrade) {
        super('settings', ((currState) => ({
            'workingSpace.displayVariant': defaultSettings.workingSpace.displayVariant,
            ...(currState || {}),
        })));
        makeObservable(this);
    }

    @computed
    get displayVariant() { return this.data['workingSpace.displayVariant']; }

    @override
    update(props = {}) {
        const updProps = pick(props, ['displayVariant']);

        super.update(mapKeys(updProps, (value, key) => `workingSpace.${key}`));
    }
}

export default WorkingSpaceSettings;
