import { action, computed, makeObservable } from 'mobx';
import { pick } from 'lodash';
import defaultSettings from '@/config/settings';
import settingsStorage from './rootSettings';

export const migration = (currState) => ({
    'workingSpace.displayVariant': currState['workingSpace.displayVariant'] || defaultSettings.workingSpace.displayVariant,
    'workingSpace.sorting': currState['workingSpace.sorting'] || defaultSettings.workingSpace.sorting,
});

class WorkingSpaceSettings {
    constructor() {
        makeObservable(this);

        this._storage = settingsStorage;
    }

    @computed
    get displayVariant() { return this._storage.data['workingSpace.displayVariant']; }

    @computed
    get sorting() { return this._storage.data['workingSpace.sorting']; }

    @action
    recalc() {}

    @action
    update(props = {}, force = false) {
        const updProps = pick(props, ['displayVariant', 'sorting']);

        this._storage.update('workingSpace', updProps, force);
    }
}

export default WorkingSpaceSettings;
