import { makeAutoObservable } from 'mobx';
import { omit } from 'lodash';
import db from '@/utils/db';
import { DESTINATION } from '@/enum';
import { FIRST_UUID, NULL_UUID } from '@/utils/generate/uuid';
import settingsStorage from '@/stores/universal/settings/rootSettings';
// import BookmarksUniversalService from '@/stores/universal/settings/settings';

class CloudSyncSettingsService {
    core;
    storage;
    settingsService;

    constructor(core) {
        makeAutoObservable(this);
        this.core = core;
        this.settingsService = core.settingsService;
    }

    async grubChanges(pairs) {
        console.log('[CloudSync] Grub settings changes...');

        const changes = {
            create: [],
            update: [],
            delete: [],
        };

        if (pairs.length === 0) {
            console.log('[CloudSync] Nothing settings changes');
            return changes;
        }

        console.log('[CloudSync] Settings changes:', pairs);

        for await (const pair of pairs) {
            const setting = await settingsStorage.data[pair.localId];

            if (!setting) continue;

            const payload = {
                name: pair.localId,
                value: JSON.stringify(setting),
            };

            if (!pair.isPair) {
                changes.create.push({
                    tempId: pair.localId,
                    entityType: 'setting',
                    createDate: new Date(pair.modifiedTimestamp).toISOString(),
                    updateDate: new Date(pair.modifiedTimestamp).toISOString(),
                    payload,
                });

                continue;
            }

            changes.update.push({
                id: pair.cloudId,
                entityType: 'setting',
                createDate: new Date(pair.modifiedTimestamp).toISOString(),
                updateDate: new Date(pair.modifiedTimestamp).toISOString(),
                payload,
            });
        }

        return changes;
    }

    _convert(rawValue) {
        try {
            return JSON.parse(rawValue);
        } catch (e) {
            return rawValue;
        }
    }

    async bulkCreate(snapshots) {
        console.log('[CloudSync] Bulk creating settings...');

        await Promise.all(snapshots.map(async (snapshot) => {
            console.log('[CloudSync] Creating setting from snapshot:', snapshot);

            const pair = await db().getFromIndex('pair_with_cloud', 'cloud_id', snapshot.id);

            if (pair) {
                console.warn(`Snapshot of setting with cloudId:${pair?.cloudId} already exist. Update...`);

                settingsStorage.updateRaw({ [snapshot.payload.name]: this._convert(snapshot.payload.value) }, false);

                await db().put('pair_with_cloud', {
                    entityType_localId: `setting_${pair.localId}`,
                    entityType: 'setting',
                    localId: pair.localId,
                    cloudId: snapshot.id,
                    isPair: +true,
                    isSync: +true,
                    isDeleted: +false,
                    modifiedTimestamp: Date.now(),
                });
            } else {
                settingsStorage.updateRaw({ [snapshot.payload.name]: this._convert(snapshot.payload.value) }, false);

                await db().add('pair_with_cloud', {
                    entityType_localId: `setting_${snapshot.payload.name}`,
                    entityType: 'setting',
                    localId: snapshot.payload.name,
                    cloudId: snapshot.id,
                    isPair: +true,
                    isSync: +true,
                    isDeleted: +false,
                    modifiedTimestamp: Date.now(),
                });
            }
        }));

        console.log('[CloudSync] Bulk settings created!');
    }

    async bulkUpdate(snapshots) {
        console.log('[CloudSync] Bulk update settings...');

        await Promise.all(snapshots.map(async (snapshot) => {
            const pair = await db().getFromIndex('pair_with_cloud', 'cloud_id', snapshot.id); // TODO Maybe many results

            if (!pair) {
                console.warn(`Snapshot of setting with cloudId:${pair?.cloudId} not exist. Creating...`);

                settingsStorage.updateRaw({ [snapshot.payload.name]: this._convert(snapshot.payload.value) }, false);

                await db().add('pair_with_cloud', {
                    entityType_localId: `bookmark_${snapshot.payload.name}`,
                    entityType: 'setting',
                    localId: snapshot.payload.name,
                    cloudId: snapshot.id,
                    isPair: +true,
                    isSync: +true,
                    isDeleted: +false,
                    modifiedTimestamp: Date.now(),
                });
            } else {
                settingsStorage.updateRaw({ [snapshot.payload.name]: this._convert(snapshot.payload.value) }, false);

                await db().put('pair_with_cloud', {
                    entityType_localId: `bookmark_${pair.localId}`,
                    entityType: 'setting',
                    localId: pair.localId,
                    cloudId: snapshot.id,
                    isPair: +true,
                    isSync: +true,
                    isDeleted: +false,
                    modifiedTimestamp: Date.now(),
                });
            }
        }));

        console.log('[CloudSync] Bulk settings updated!');
    }

    async bulkDelete(snapshots) {
        console.log('[CloudSync] Bulk delete settings...');

        await Promise.all(snapshots.map(async (snapshot) => {
            const pair = await db().getFromIndex('pair_with_cloud', 'cloud_id', snapshot.id); // TODO Maybe many results

            if (!pair) return;

            settingsStorage.updateRaw({ [snapshot.payload.name]: null }, false);
            await db().delete('pair_with_cloud', `bookmark_${pair.localId}`);
        }));

        console.log('[CloudSync] Bulk settings deleted!');
    }

    async applyChanges({ create, update, delete: deleteEntities }) {
        const createFiltered = create.filter(({ entityType }) => entityType === 'setting');
        const updateFiltered = update.filter(({ entityType }) => entityType === 'setting');
        const deleteFiltered = deleteEntities.filter(({ entityType }) => entityType === 'setting');

        await this.bulkCreate(createFiltered);
        await this.bulkUpdate(updateFiltered);
        await this.bulkDelete(deleteFiltered);

        if (createFiltered.length !== 0 || updateFiltered.length !== 0 || deleteFiltered !== 0) {
            this.core.globalEventBus.call('setting/new', DESTINATION.APP);
        }
    }
}

export default CloudSyncSettingsService;
