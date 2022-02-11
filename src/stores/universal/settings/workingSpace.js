import { computed, makeObservable, override } from 'mobx';
import { pick } from 'lodash';
import PersistentStorage from '../storage/persistent';
import defaultSettings from '@/config/settings';

class WorkingSpaceSettings extends PersistentStorage {
    constructor(upgrade) {
        super('workingSpace', upgrade && ((currState) => ({
            displayVariant: defaultSettings.workingSpace.displayVariant,
            ...(currState || {}),
        })));
        makeObservable(this);
    }

    @computed
    get displayVariant() { return this.data.displayVariant; }

    @override
    update(props = {}) {
        const updProps = pick(props, ['displayVariant']);

        super.update(updProps);
    }
}

export default WorkingSpaceSettings;
