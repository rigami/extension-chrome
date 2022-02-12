import { makeObservable, override } from 'mobx';
import { forEach, mapKeys } from 'lodash';
import PersistentStorage from '../storage/persistent';
import { migration as migrationApp } from '@/stores/universal/settings/app';
import { migration as migrationDesktop } from '@/stores/universal/settings/desktop';
import { migration as migrationWallpapers } from '@/stores/universal/settings/wallpapers';
import { migration as migrationWidgets } from '@/stores/universal/settings/widgets';
import { migration as migrationWorkingSpace } from '@/stores/universal/settings/workingSpace';
import db from '@/utils/db';

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

    updateRaw(props = {}, sync = true) {
        console.log('SettingsStorage update raw:', props);

        super.update(props);

        if (sync) {
            forEach(props, async (value, key) => {
                console.log('SettingsStorage update prop:', value, key);
                const pairRow = await db().get('pair_with_cloud', `setting_${key}`);

                db().put('pair_with_cloud', {
                    entityType_localId: `setting_${key}`,
                    entityType: 'setting',
                    localId: key,
                    cloudId: pairRow?.cloudId || null,
                    isPair: +Boolean(pairRow?.cloudId),
                    isSync: +false,
                    isDeleted: +false,
                    modifiedTimestamp: Date.now(),
                });
            });
        }
    }

    @override
    update(namespace, props = {}, sync = true) {
        console.log('SettingsStorage update:', namespace, props);

        super.update(mapKeys(props, (value, key) => `${namespace}.${key}`));

        if (sync) {
            forEach(props, async (value, key) => {
                console.log('SettingsStorage update prop:', value, key);
                try {
                    const pairRow = await db().get('pair_with_cloud', `setting_${namespace}.${key}`);

                    console.log('pairRow:', pairRow);

                    db().put('pair_with_cloud', {
                        entityType_localId: `setting_${namespace}.${key}`,
                        entityType: 'setting',
                        localId: `${namespace}.${key}`,
                        cloudId: pairRow?.cloudId || null,
                        isPair: +Boolean(pairRow?.cloudId),
                        isSync: +false,
                        isDeleted: +false,
                        modifiedTimestamp: Date.now(),
                    });
                } catch (e) {
                    console.error('ERR:', e);
                }
            });
        }
    }
}

const settingsStorage = new RootSettings();

export default settingsStorage;
