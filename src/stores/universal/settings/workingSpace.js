import { computed, makeObservable, override } from 'mobx';
import { pick } from 'lodash';
import defaultSettings from '@/config/settings';
import settingsStorage from '@/stores/universal/settings/rootSettings';

export const migration = (currState) => ({ 'workingSpace.displayVariant': currState['workingSpace.displayVariant'] || defaultSettings.workingSpace.displayVariant });

class WorkingSpaceSettings {
    constructor() {
        makeObservable(this);

        this._storage = settingsStorage;
    }

    @computed
    get displayVariant() { return this._storage.data['workingSpace.displayVariant']; }

    update(props = {}) {
        const updProps = pick(props, ['displayVariant']);

        super.update('workingSpace', updProps);
    }
}

export default WorkingSpaceSettings;
