import { makeObservable, override } from 'mobx';
import { mapKeys } from 'lodash';
import PersistentStorage from '../storage/persistent';
import { migration as migrationApp } from '@/stores/universal/settings/app';
import { migration as migrationDesktop } from '@/stores/universal/settings/desktop';
import { migration as migrationWallpapers } from '@/stores/universal/settings/wallpapers';
import { migration as migrationWidgets } from '@/stores/universal/settings/widgets';
import { migration as migrationWorkingSpace } from '@/stores/universal/settings/workingSpace';

class RootSettings extends PersistentStorage {
    constructor() {
        super('settings', ((currState) => ({
            ...migrationApp(currState),
            ...migrationDesktop(currState),
            ...migrationWallpapers(currState),
            ...migrationWidgets(currState),
            ...migrationWorkingSpace(currState),
        })));
        makeObservable(this);
    }

    @override
    update(namespace, props = {}) {
        super.update(mapKeys(props, (value, key) => `${namespace}.${key}`));
    }
}

const settingsStorage = new RootSettings();

export default settingsStorage;
