import { makeAutoObservable } from 'mobx';
import db from '@/utils/db';
import { DESTINATION } from '@/enum';
import { NULL_UUID } from '@/utils/generate/uuid';
import BookmarksUniversalService from '@/stores/universal/bookmarks/bookmarks';

class CloudSyncBookmarksService {
    core;
    storage;

    constructor(core) {
        makeAutoObservable(this);
        this.core = core;
    }

    async grubChanges(pairs) {
        console.log('[CloudSync] Grub bookmarks changes...');

        const changes = {
            create: [],
            update: [],
            delete: [],
        };

        if (pairs.length === 0) {
            console.log('[CloudSync] Nothing bookmarks changes');
            return changes;
        }

        for await (const pair of pairs) {
            if (pair.isDeleted && pair.isPair) {
                changes.delete.push({
                    id: pair.cloudId,
                    entityType: 'bookmark',
                    deleteDate: new Date(pair.modifiedTimestamp).toISOString(),
                });

                continue;
            }

            const bookmark = await db().get('bookmarks', pair.localId);

            if (!bookmark) continue;

            const folder = await db().get('pair_with_cloud', `folder_${bookmark.folderId}`);
            const tags = await Promise.all(bookmark.tags.map((id) => db().get('pair_with_cloud', `tag_${id}`)));

            let payload = {
                title: bookmark.name,
                description: bookmark.description,
                variant: bookmark.icoVariant?.toLowerCase() || 'symbol',
                url: bookmark.url,
                imageUrl: bookmark.icoUrl || '',
            };

            if (bookmark.folderId === NULL_UUID || folder?.isPair) {
                payload = {
                    ...payload,
                    folderId: folder?.cloudId || NULL_UUID,
                };
            } else {
                payload = {
                    ...payload,
                    folderTempId: bookmark.folderId,
                };
            }

            const pairTags = tags.filter(({ isPair }) => isPair);
            const notPairTags = tags.filter(({ isPair }) => !isPair);

            payload = {
                ...payload,
                tagsIds: pairTags.map(({ cloudId }) => cloudId),
                tagsTempIds: notPairTags.map(({ localId }) => localId),
            };

            if (!pair.isPair) {
                changes.create.push({
                    tempId: pair.localId,
                    entityType: 'bookmark',
                    createDate: new Date(bookmark.createTimestamp).toISOString(),
                    updateDate: new Date(bookmark.modifiedTimestamp).toISOString(),
                    payload,
                });

                continue;
            }

            changes.update.push({
                id: pair.cloudId,
                entityType: 'bookmark',
                createDate: new Date(bookmark.createTimestamp).toISOString(),
                updateDate: new Date(bookmark.modifiedTimestamp).toISOString(),
                payload,
            });
        }

        return changes;
    }

    async bulkCreate(snapshots) {
        console.log('[CloudSync] Bulk creating bookmarks...');

        await Promise.all(snapshots.map(async (snapshot) => {
            console.log('[CloudSync] Creating bookmark from snapshot:', snapshot);
            const pair = await db().getFromIndex('pair_with_cloud', 'cloud_id', snapshot.id);
            const folderPair = await db().getFromIndex('pair_with_cloud', 'cloud_id', snapshot.payload.folderId);
            const tagPairs = await Promise.all(snapshot.payload.tagsIds.map((id) => db().get('pair_with_cloud', `tag_${id}`)));

            if (pair) {
                console.warn(`Snapshot of bookmark with cloudId:${pair?.cloudId} already exist. Update...`);

                await BookmarksUniversalService.save({
                    id: pair.localId,
                    icoVariant: snapshot.payload.variant.toUpperCase(),
                    url: snapshot.payload.url,
                    icoUrl: snapshot.payload.imageUrl || '',
                    name: snapshot.payload.title,
                    description: snapshot.payload.description,
                    tags: tagPairs.map(({ localId }) => localId),
                    folderId: folderPair.localId,
                    createTimestamp: new Date(snapshot.createDate).valueOf(),
                    modifiedTimestamp: new Date(snapshot.updateDate).valueOf(),
                }, false);

                await db().put('pair_with_cloud', {
                    entityType_localId: `bookmark_${pair.localId}`,
                    entityType: 'bookmark',
                    localId: pair.localId,
                    cloudId: snapshot.id,
                    isPair: +true,
                    isSync: +true,
                    isDeleted: +false,
                    modifiedTimestamp: Date.now(),
                });
            } else {
                const localTagId = await BookmarksUniversalService.save({
                    id: pair?.id,
                    icoVariant: snapshot.payload.variant.toUpperCase(),
                    url: snapshot.payload.url,
                    icoUrl: snapshot.payload.imageUrl || '',
                    name: snapshot.payload.title,
                    description: snapshot.payload.description,
                    tags: tagPairs.map(({ localId }) => localId),
                    folderId: folderPair.localId,
                    createTimestamp: new Date(snapshot.createDate).valueOf(),
                    modifiedTimestamp: new Date(snapshot.updateDate).valueOf(),
                }, false);

                await db().add('pair_with_cloud', {
                    entityType_localId: `bookmark_${localTagId}`,
                    entityType: 'bookmark',
                    localId: localTagId,
                    cloudId: snapshot.id,
                    isPair: +true,
                    isSync: +true,
                    isDeleted: +false,
                    modifiedTimestamp: Date.now(),
                });
            }
        }));

        console.log('[CloudSync] Bulk bookmarks created!');
    }

    async bulkUpdate(snapshots) {
        console.log('[CloudSync] Bulk update bookmarks...');

        await Promise.all(snapshots.map(async (snapshot) => {
            const pair = await db().getFromIndex('pair_with_cloud', 'cloud_id', snapshot.id); // TODO Maybe many results
            const folderPair = await db().getFromIndex('pair_with_cloud', 'cloud_id', snapshot.payload.folderId);
            const tagPairs = await Promise.all(snapshot.payload.tagsIds.map((id) => db().get('pair_with_cloud', `tag_${id}`)));

            await BookmarksUniversalService.save({
                id: pair.localId,
                icoVariant: snapshot.payload.variant.toUpperCase(),
                url: snapshot.payload.url,
                icoUrl: snapshot.payload.imageUrl || '',
                name: snapshot.payload.title,
                description: snapshot.payload.description,
                tags: tagPairs.map(({ localId }) => localId),
                folderId: folderPair.localId,
                createTimestamp: new Date(snapshot.createDate).valueOf(),
                modifiedTimestamp: new Date(snapshot.updateDate).valueOf(),
            }, false);

            await db().put('pair_with_cloud', {
                entityType_localId: `bookmark_${pair.localId}`,
                entityType: 'bookmark',
                localId: pair.localId,
                cloudId: snapshot.id,
                isPair: +true,
                isSync: +true,
                isDeleted: +false,
                modifiedTimestamp: Date.now(),
            });
        }));

        console.log('[CloudSync] Bulk bookmarks updated!');
    }

    async bulkDelete(snapshots) {
        console.log('[CloudSync] Bulk delete bookmarks...');

        await Promise.all(snapshots.map(async (snapshot) => {
            const pair = await db().getFromIndex('pair_with_cloud', 'cloud_id', snapshot.id); // TODO Maybe many results

            await BookmarksUniversalService.remove(pair.localId, false);
            await db().delete('pair_with_cloud', `bookmark_${pair.localId}`);
        }));

        console.log('[CloudSync] Bulk bookmarks deleted!');
    }

    async applyChanges({ create, update, delete: deleteEntities }) {
        const createFiltered = create.filter(({ entityType }) => entityType === 'bookmark');
        const updateFiltered = update.filter(({ entityType }) => entityType === 'bookmark');
        const deleteFiltered = deleteEntities.filter(({ entityType }) => entityType === 'bookmark');

        await this.bulkCreate(createFiltered);
        await this.bulkUpdate(updateFiltered);
        await this.bulkDelete(deleteFiltered);

        if (createFiltered.length !== 0 || updateFiltered.length !== 0 || deleteFiltered !== 0) {
            this.core.globalEventBus.call('bookmark/new', DESTINATION.APP);
        }
    }
}

export default CloudSyncBookmarksService;
