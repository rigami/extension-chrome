import { makeAutoObservable } from 'mobx';
import db from '@/utils/db';
import commitsToChanged from '@/stores/server/cloudSync/utils/commitsToChanged';
import TagsUniversalService from '@/stores/universal/bookmarks/tags';
import { DESTINATION } from '@/enum';

class CloudSyncTagsService {
    core;
    storage;

    constructor(core) {
        makeAutoObservable(this);
        this.core = core;
    }

    async applyChanges(changes) {
        console.log('[CloudSync] Apply tags updates...');

        await Promise.all(changes.create.map((serverTag) => TagsUniversalService
            .save({
                ...serverTag,
                id: serverTag.id,
                name: serverTag.name,
                colorKey: serverTag.colorKey,
                createTimestamp: new Date(serverTag.createDate).valueOf(),
                modifiedTimestamp: new Date(serverTag.updateDate).valueOf(),
            }, false)));

        await Promise.all(changes.update.map(async (serverTag) => {
            const localTag = await TagsUniversalService.get(serverTag.id);

            if (localTag.modifiedTimestamp >= new Date(serverTag.updateDate).valueOf()) return;

            await TagsUniversalService
                .save({
                    ...serverTag,
                    id: serverTag.id,
                    name: serverTag.name,
                    colorKey: serverTag.colorKey,
                    createTimestamp: new Date(serverTag.createDate).valueOf(),
                    modifiedTimestamp: new Date(serverTag.updateDate).valueOf(),
                }, false);
        }));

        await Promise.all(changes.delete.map(async ({ id, updateDate }) => {
            const localTag = await TagsUniversalService.get(id);

            if (!localTag || localTag.modifiedTimestamp >= new Date(updateDate).valueOf()) return;

            await TagsUniversalService.remove(id, false);
        }));

        if (changes.create.length + changes.update.length + changes.delete.length !== 0) {
            this.core.globalEventBus.call('tag/new', DESTINATION.APP);
        }
    }

    async grubNotSyncedChanges() {
        console.log('[CloudSync] Grub tags changes...');

        const commits = await db().getAll('tags_wait_sync');

        if (commits.length === 0) {
            console.log('[CloudSync] Nothing tags changes');
            return null;
        }

        const changesItems = commitsToChanged('tagId', commits);

        if ('create' in changesItems) {
            changesItems.create = await Promise.all(
                changesItems.create.map(async ({ tagId, commitDate }) => {
                    const tag = await db().get('tags', tagId);

                    if (!tag) return null;

                    return {
                        id: tag.id,
                        name: tag.name,
                        colorKey: tag.colorKey,
                        lastAction: 'create',
                        createDate: new Date(tag.createTimestamp).toISOString(),
                        updateDate: commitDate,
                    };
                }),
            );

            changesItems.create = changesItems.create.filter((isExist) => isExist);
        }

        if ('update' in changesItems) {
            changesItems.update = await Promise.all(
                changesItems.update.map(async ({ tagId, commitDate }) => {
                    const tag = await db().get('tags', tagId);

                    if (!tag) return null;

                    return {
                        id: tag.id,
                        name: tag.name,
                        colorKey: tag.colorKey,
                        lastAction: 'update',
                        createDate: new Date(tag.createTimestamp).toISOString(),
                        updateDate: commitDate,
                    };
                }),
            );

            changesItems.update = changesItems.update.filter((isExist) => isExist);
        }

        if ('delete' in changesItems) {
            changesItems.delete = changesItems.delete.map(({ tagId, commitDate }) => ({
                id: tagId,
                updateDate: commitDate,
            }));
        }

        return changesItems;
    }

    async clearNotSyncedChanges() {
        console.log('[CloudSync] Clear await synced folders changes...');

        await db().clear('tags_wait_sync');
    }
}

export default CloudSyncTagsService;
