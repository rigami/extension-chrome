import { makeAutoObservable } from 'mobx';
import db from '@/utils/db';
import { DESTINATION } from '@/enum';
import { FIRST_UUID, NULL_UUID } from '@/utils/generate/uuid';
import FavoritesUniversalService from '@/stores/universal/bookmarks/favorites';

class CloudSyncFavoritesService {
    core;
    storage;

    constructor(core) {
        makeAutoObservable(this);
        this.core = core;
    }

    async grubChanges(pairs) {
        console.log('[CloudSync] Grub favorites changes...');

        const changes = {
            create: [],
            update: [],
            delete: [],
        };

        if (pairs.length === 0) {
            console.log('[CloudSync] Nothing favorites changes');
            return changes;
        }

        for await (const pair of pairs) {
            if (pair.isDeleted && pair.isPair) {
                changes.delete.push({
                    id: pair.cloudId,
                    entityType: 'favorite',
                    deleteDate: new Date(pair.modifiedTimestamp).toISOString(),
                });

                continue;
            }

            const favorite = await db().get('favorites', pair.localId);

            if (!favorite) continue;

            const item = await db().get('pair_with_cloud', `${favorite.itemType}_${favorite.itemId}`);

            let payload = {
                itemId: item.id,
                itemType: favorite.itemType,
            };

            if (item?.isPair) {
                payload = {
                    ...payload,
                    itemId: item.cloudId,
                };
            } else {
                payload = {
                    ...payload,
                    itemTempId: favorite.itemId,
                };
            }

            if (!pair.isPair) {
                changes.create.push({
                    tempId: pair.localId,
                    entityType: 'favorite',
                    createDate: new Date(favorite.createTimestamp).toISOString(),
                    updateDate: new Date(favorite.modifiedTimestamp).toISOString(),
                    payload,
                });

                continue;
            }

            changes.update.push({
                id: pair.cloudId,
                entityType: 'favorite',
                createDate: new Date(favorite.createTimestamp).toISOString(),
                updateDate: new Date(favorite.modifiedTimestamp).toISOString(),
                payload,
            });
        }

        return changes;
    }

    async bulkCreate(snapshots) {
        console.log('[CloudSync] Bulk creating favorites...');

        await Promise.all(snapshots.map(async (snapshot) => {
            console.log('[CloudSync] Creating favorite from snapshot:', snapshot);
            const pair = await db().getFromIndex('pair_with_cloud', 'cloud_id', snapshot.id);
            const itemPair = await db().getFromIndex('pair_with_cloud', 'cloud_id', snapshot.payload.itemId);

            if (pair) {
                console.warn(`Snapshot of favorite with cloudId:${pair?.cloudId} already exist. Update...`);

                await FavoritesUniversalService.removeFromFavorites(pair.localId, false);
                await FavoritesUniversalService.addToFavorites({
                    id: pair.localId,
                    itemId: itemPair.localId,
                    itemType: snapshot.payload.itemType,
                    createTimestamp: new Date(snapshot.createDate).valueOf(),
                    modifiedTimestamp: new Date(snapshot.updateDate).valueOf(),
                }, false);

                await db().put('pair_with_cloud', {
                    entityType_localId: `favorite_${pair.localId}`,
                    entityType: 'favorite',
                    localId: pair.localId,
                    cloudId: snapshot.id,
                    isPair: +true,
                    isSync: +true,
                    isDeleted: +false,
                    modifiedTimestamp: Date.now(),
                });
            } else {
                const localTagId = await FavoritesUniversalService.addToFavorites({
                    id: pair?.id,
                    itemId: itemPair.localId,
                    itemType: snapshot.payload.itemType,
                    createTimestamp: new Date(snapshot.createDate).valueOf(),
                    modifiedTimestamp: new Date(snapshot.updateDate).valueOf(),
                }, false);

                await db().add('pair_with_cloud', {
                    entityType_localId: `favorite_${localTagId}`,
                    entityType: 'favorite',
                    localId: localTagId,
                    cloudId: snapshot.id,
                    isPair: +true,
                    isSync: +true,
                    isDeleted: +false,
                    modifiedTimestamp: Date.now(),
                });
            }
        }));

        console.log('[CloudSync] Bulk favorites created!');
    }

    async bulkUpdate(snapshots) {
        console.log('[CloudSync] Bulk update favorites...');

        /*  await Promise.all(snapshots.map(async (snapshot) => {
            const pair = await db().getFromIndex('pair_with_cloud', 'cloud_id', snapshot.id); // TODO Maybe many results
            const itemPair = await db().getFromIndex('pair_with_cloud', 'cloud_id', snapshot.payload.itemId);

            if (!pair) {
                console.warn(`Snapshot of favorite with cloudId:${pair?.cloudId} not exist. Creating...`);

                const localTagId = await FavoritesUniversalService.addToFavorites({
                    itemId: itemPair.localId,
                    itemType: snapshot.payload.itemType,
                    createTimestamp: new Date(snapshot.createDate).valueOf(),
                    modifiedTimestamp: new Date(snapshot.updateDate).valueOf(),
                }, false);

                await db().add('pair_with_cloud', {
                    entityType_localId: `favorite_${localTagId}`,
                    entityType: 'favorite',
                    localId: localTagId,
                    cloudId: snapshot.id,
                    isPair: +true,
                    isSync: +true,
                    isDeleted: +false,
                    modifiedTimestamp: Date.now(),
                });
            } else {
                await FavoritesUniversalService.addToFavorites({
                    id: pair.localId,
                    itemId: itemPair.localId,
                    itemType: snapshot.payload.itemType,
                    createTimestamp: new Date(snapshot.createDate).valueOf(),
                    modifiedTimestamp: new Date(snapshot.updateDate).valueOf(),
                }, false);

                await db().put('pair_with_cloud', {
                    entityType_localId: `favorite_${pair.localId}`,
                    entityType: 'favorite',
                    localId: pair.localId,
                    cloudId: snapshot.id,
                    isPair: +true,
                    isSync: +true,
                    isDeleted: +false,
                    modifiedTimestamp: Date.now(),
                });
            }
        })); */

        console.log('[CloudSync] Bulk favorites updated!');
    }

    async bulkDelete(snapshots) {
        console.log('[CloudSync] Bulk delete favorites...');

        await Promise.all(snapshots.map(async (snapshot) => {
            const pair = await db().getFromIndex('pair_with_cloud', 'cloud_id', snapshot.id); // TODO Maybe many results

            if (!pair) return;

            await FavoritesUniversalService.removeFromFavorites(pair.localId, false);
            await db().delete('pair_with_cloud', `favorite_${pair.localId}`);
        }));

        console.log('[CloudSync] Bulk favorites deleted!');
    }

    async applyChanges({ create, update, delete: deleteEntities }) {
        const createFiltered = create.filter(({ entityType }) => entityType === 'favorite');
        const updateFiltered = update.filter(({ entityType }) => entityType === 'favorite');
        const deleteFiltered = deleteEntities.filter(({ entityType }) => entityType === 'favorite');

        await this.bulkCreate(createFiltered);
        await this.bulkUpdate(updateFiltered);
        await this.bulkDelete(deleteFiltered);

        if (createFiltered.length !== 0 || updateFiltered.length !== 0 || deleteFiltered !== 0) {
            this.core.globalEventBus.call('favorite/new', DESTINATION.APP);
        }
    }
}

export default CloudSyncFavoritesService;
