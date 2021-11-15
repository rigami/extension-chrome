import { makeAutoObservable } from 'mobx';
import db from '@/utils/db';
import TagsUniversalService from '@/stores/universal/bookmarks/tags';
import { DESTINATION } from '@/enum';
import { NULL_UUID } from '@/utils/generate/uuid';

class CloudSyncTagsService {
    core;
    storage;

    constructor(core) {
        makeAutoObservable(this);
        this.core = core;
    }

    async grubChanges(pairs) {
        console.log('[CloudSync] Grub tags changes...');

        const changes = {
            create: [],
            update: [],
            delete: [],
        };

        if (pairs.length === 0) {
            console.log('[CloudSync] Nothing tags changes');
            return changes;
        }

        for await (const pair of pairs) {
            if (pair.isDeleted && pair.isPair) {
                changes.delete.push({
                    id: pair.cloudId,
                    entityType: 'tag',
                    deleteDate: new Date(pair.modifiedTimestamp).toISOString(),
                });

                continue;
            }

            const tag = await db().get('tags', pair.localId);

            if (!tag) continue;

            const payload = {
                name: tag.name,
                colorKey: tag.colorKey,
            };

            if (!pair.isPair) {
                changes.create.push({
                    tempId: pair.localId,
                    entityType: 'tag',
                    createDate: new Date(tag.createTimestamp).toISOString(),
                    updateDate: new Date(tag.modifiedTimestamp).toISOString(),
                    payload,
                });

                continue;
            }

            changes.update.push({
                id: pair.cloudId,
                entityType: 'tag',
                createDate: new Date(tag.createTimestamp).toISOString(),
                updateDate: new Date(tag.modifiedTimestamp).toISOString(),
                payload,
            });
        }

        return changes;
    }

    async bulkCreate(snapshots) {
        console.log('[CloudSync] Bulk creating tags...');

        await Promise.all(snapshots.map(async (snapshot) => {
            console.log('[CloudSync] Creating tag from snapshot:', snapshot);
            const pair = await db().getFromIndex('pair_with_cloud', 'cloud_id', snapshot.id);

            if (pair) {
                console.warn(`Snapshot of tag with cloudId:${pair?.cloudId} already exist. Update...`);

                await TagsUniversalService.save({
                    id: pair.localId,
                    name: snapshot.payload.name,
                    colorKey: snapshot.payload.colorKey,
                    createTimestamp: new Date(snapshot.createDate).valueOf(),
                    modifiedTimestamp: new Date(snapshot.updateDate).valueOf(),
                }, false);

                await db().put('pair_with_cloud', {
                    entityType_localId: `tag_${pair.localId}`,
                    entityType: 'tag',
                    localId: pair.localId,
                    cloudId: snapshot.id,
                    isPair: +true,
                    isSync: +true,
                    isDeleted: +false,
                    modifiedTimestamp: Date.now(),
                });
            } else {
                const localTagId = await TagsUniversalService.save({
                    id: pair?.id,
                    name: snapshot.payload.name,
                    colorKey: snapshot.payload.colorKey,
                    createTimestamp: new Date(snapshot.createDate).valueOf(),
                    modifiedTimestamp: new Date(snapshot.updateDate).valueOf(),
                }, false);

                await db().add('pair_with_cloud', {
                    entityType_localId: `tag_${localTagId}`,
                    entityType: 'tag',
                    localId: localTagId,
                    cloudId: snapshot.id,
                    isPair: +true,
                    isSync: +true,
                    isDeleted: +false,
                    modifiedTimestamp: Date.now(),
                });
            }
        }));

        console.log('[CloudSync] Bulk tags created!');
    }

    async bulkUpdate(snapshots) {
        console.log('[CloudSync] Bulk update tags...');

        await Promise.all(snapshots.map(async (snapshot) => {
            const pair = await db().getFromIndex('pair_with_cloud', 'cloud_id', snapshot.id); // TODO Maybe many results

            await TagsUniversalService.save({
                id: pair.localId,
                name: snapshot.payload.name,
                colorKey: snapshot.payload.colorKey,
                createTimestamp: new Date(snapshot.createDate).valueOf(),
                modifiedTimestamp: new Date(snapshot.updateDate).valueOf(),
            }, false);

            await db().put('pair_with_cloud', {
                entityType_localId: `tag_${pair.localId}`,
                entityType: 'tag',
                localId: pair.localId,
                cloudId: snapshot.id,
                isPair: +true,
                isSync: +true,
                isDeleted: +false,
                modifiedTimestamp: Date.now(),
            });
        }));

        console.log('[CloudSync] Bulk tags updated!');
    }

    async bulkDelete(snapshots) {
        console.log('[CloudSync] Bulk delete tags...');

        await Promise.all(snapshots.map(async (snapshot) => {
            const pair = await db().getFromIndex('pair_with_cloud', 'cloud_id', snapshot.id); // TODO Maybe many results

            await TagsUniversalService.remove(pair.localId, false);
            await db().delete('pair_with_cloud', `tag_${pair.localId}`);
        }));

        console.log('[CloudSync] Bulk tags deleted!');
    }

    async applyChanges({ create, update, delete: deleteEntities }) {
        const createFiltered = create.filter(({ entityType }) => entityType === 'tag');
        const updateFiltered = update.filter(({ entityType }) => entityType === 'tag');
        const deleteFiltered = deleteEntities.filter(({ entityType }) => entityType === 'tag');

        await this.bulkCreate(createFiltered);
        await this.bulkUpdate(updateFiltered);
        await this.bulkDelete(deleteFiltered);

        if (createFiltered.length !== 0 || updateFiltered.length !== 0 || deleteFiltered !== 0) {
            this.core.globalEventBus.call('tag/new', DESTINATION.APP);
        }
    }
}

export default CloudSyncTagsService;
