import { makeAutoObservable } from 'mobx';
import { map } from 'lodash';
import db from '@/utils/db';
import FoldersUniversalService from '@/stores/universal/workingSpace/folders';
import { FIRST_UUID, NULL_UUID } from '@/utils/generate/uuid';
import { DESTINATION } from '@/enum';

class CloudSyncFoldersService {
    core;
    storage;

    constructor(core) {
        makeAutoObservable(this);
        this.core = core;
    }

    async grubChanges(pairs) {
        console.log('[CloudSync] Grub folders changes...');

        const changes = {
            create: [],
            update: [],
            delete: [],
        };

        if (pairs.length === 0) {
            console.log('[CloudSync] Nothing folders changes');
            return changes;
        }

        for await (const pair of pairs) {
            if (pair.isDeleted && pair.isPair) {
                changes.delete.push({
                    id: pair.cloudId,
                    entityType: 'folder',
                    deleteDate: new Date(pair.modifiedTimestamp).toISOString(),
                });

                continue;
            }

            const folder = await db().get('folders', pair.localId);

            if (!folder) continue;

            const parentFolder = await db().get('pair_with_cloud', `folder_${folder.parentId}`);

            let payload = { name: folder.name };

            if (folder.parentId === NULL_UUID || parentFolder?.isPair) {
                payload = {
                    ...payload,
                    parentId: parentFolder?.cloudId || NULL_UUID,
                };
            } else {
                payload = {
                    ...payload,
                    parentTempId: folder.parentId,
                };
            }

            if (!pair.isPair) {
                changes.create.push({
                    tempId: pair.localId,
                    entityType: 'folder',
                    createDate: new Date(folder.createTimestamp).toISOString(),
                    updateDate: new Date(folder.modifiedTimestamp).toISOString(),
                    payload,
                });

                continue;
            }

            changes.update.push({
                id: pair.cloudId,
                entityType: 'folder',
                createDate: new Date(folder.createTimestamp).toISOString(),
                updateDate: new Date(folder.modifiedTimestamp).toISOString(),
                payload,
            });
        }

        return changes;
    }

    async _asTree(folders, processFolder) {
        console.log('[CloudSync] As tree processing start...');
        let foldersByParentId = {};

        folders.forEach((snapshot) => {
            foldersByParentId = {
                ...(foldersByParentId || {}),
                [snapshot.payload.parentId]: [...(foldersByParentId[snapshot.payload.parentId] || []), snapshot],
            };
        });

        foldersByParentId = map(foldersByParentId, (levelFolders, parentId) => ({
            snapshots: levelFolders,
            parentId,
        }));

        console.log('[CloudSync] Levels:', foldersByParentId);

        const syncedLevels = [];

        while (foldersByParentId.length !== syncedLevels.length) {
            for await (const level of foldersByParentId) {
                if (syncedLevels.indexOf(level.parentId) !== -1) continue;

                const rootFolder = await db().getFromIndex('pair_with_cloud', 'cloud_id', level.parentId);

                if (!rootFolder && level.parentId !== NULL_UUID) continue;

                for await (const snapshot of level.snapshots) {
                    await processFolder(snapshot);
                }
                syncedLevels.push(level.parentId);
            }
        }
    }

    async bulkCreate(snapshots) {
        console.log('[CloudSync] Bulk creating folders...');

        const create = async (snapshot) => {
            console.log('[CloudSync] Creating folder from snapshot:', snapshot);
            const pair = await db().getFromIndex('pair_with_cloud', 'cloud_id', snapshot.id);
            const pairParent = await db().getFromIndex('pair_with_cloud', 'cloud_id', snapshot.payload.parentId); // TODO Maybe many results

            if (pair) {
                console.warn(`Snapshot of folder with cloudId:${pair?.cloudId} already exist. Update...`);

                await FoldersUniversalService.save({
                    id: pair.localId,
                    parentId: pairParent?.localId || NULL_UUID,
                    name: snapshot.payload.name,
                    createTimestamp: new Date(snapshot.createDate).valueOf(),
                    modifiedTimestamp: new Date(snapshot.updateDate).valueOf(),
                }, false);

                await db().put('pair_with_cloud', {
                    entityType_localId: `folder_${pair.localId}`,
                    entityType: 'folder',
                    localId: pair.localId,
                    cloudId: snapshot.id,
                    isPair: +true,
                    isSync: +true,
                    isDeleted: +false,
                    modifiedTimestamp: Date.now(),
                });
            } else {
                const localFolderId = await FoldersUniversalService.save({
                    id: pair?.id,
                    parentId: pairParent?.localId || NULL_UUID,
                    name: snapshot.payload.name,
                    createTimestamp: new Date(snapshot.createDate).valueOf(),
                    modifiedTimestamp: new Date(snapshot.updateDate).valueOf(),
                }, false);

                await db().add('pair_with_cloud', {
                    entityType_localId: `folder_${localFolderId}`,
                    entityType: 'folder',
                    localId: localFolderId,
                    cloudId: snapshot.id,
                    isPair: +true,
                    isSync: +true,
                    isDeleted: +false,
                    modifiedTimestamp: Date.now(),
                });
            }
        };

        await this._asTree(
            snapshots,
            create,
        );
        console.log('[CloudSync] Bulk folders created!');
    }

    async bulkUpdate(snapshots) {
        console.log('[CloudSync] Bulk update folders...');

        await Promise.all(snapshots.map(async (snapshot) => {
            const pair = await db().getFromIndex('pair_with_cloud', 'cloud_id', snapshot.id); // TODO Maybe many results
            const pairParent = await db().getFromIndex('pair_with_cloud', 'cloud_id', snapshot.payload.parentId); // TODO Maybe many results

            await FoldersUniversalService.save({
                id: pair?.localId || FIRST_UUID,
                parentId: pairParent?.localId || NULL_UUID,
                name: snapshot.payload.name,
                createTimestamp: new Date(snapshot.createDate).valueOf(),
                modifiedTimestamp: new Date(snapshot.updateDate).valueOf(),
            }, false);

            await db().put('pair_with_cloud', {
                entityType_localId: `folder_${pair?.localId || FIRST_UUID}`,
                entityType: 'folder',
                localId: pair?.localId || FIRST_UUID,
                cloudId: snapshot.id,
                isPair: +true,
                isSync: +true,
                isDeleted: +false,
                modifiedTimestamp: Date.now(),
            });
        }));

        console.log('[CloudSync] Bulk folders udpated!');
    }

    async bulkDelete(snapshots) {
        console.log('[CloudSync] Bulk delete folders...');

        await Promise.all(snapshots.map(async (snapshot) => {
            const pair = await db().getFromIndex('pair_with_cloud', 'cloud_id', snapshot.id); // TODO Maybe many results

            await FoldersUniversalService.remove(pair.localId, false);
            await db().delete('pair_with_cloud', `folder_${pair.localId}`);
        }));

        console.log('[CloudSync] Bulk folders udpated!');
    }

    async applyChanges({ create, update, delete: deleteEntities }) {
        const createFiltered = create.filter(({ entityType }) => entityType === 'folder');
        const updateFiltered = update.filter(({ entityType }) => entityType === 'folder');
        const deleteFiltered = deleteEntities.filter(({ entityType }) => entityType === 'folder');

        await this.bulkCreate(createFiltered);
        await this.bulkUpdate(updateFiltered);
        await this.bulkDelete(deleteFiltered);

        if (createFiltered.length !== 0 || updateFiltered.length !== 0 || deleteFiltered !== 0) {
            this.core.globalEventBus.call('folder/new', DESTINATION.APP);
        }
    }
}

export default CloudSyncFoldersService;
