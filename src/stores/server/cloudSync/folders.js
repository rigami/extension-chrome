import { makeAutoObservable } from 'mobx';
import db from '@/utils/db';
import commitsToChanged from '@/stores/server/cloudSync/utils/commitsToChanged';
import FoldersUniversalService from '@/stores/universal/bookmarks/folders';
import { DESTINATION } from '@/enum';

class CloudSyncFoldersService {
    core;
    storage;

    constructor(core) {
        makeAutoObservable(this);
        this.core = core;
    }

    async applyChanges(changes) {
        console.log('[CloudSync] Apply folders updates...');

        console.log('changes:', changes);

        await Promise.all(changes.create.map((serverFolder) => FoldersUniversalService
            .save({
                ...serverFolder,
                id: serverFolder.id,
                parentId: serverFolder.parentId,
                name: serverFolder.name,
                createTimestamp: new Date(serverFolder.createDate).valueOf(),
                modifiedTimestamp: new Date(serverFolder.updateDate).valueOf(),
            }, false)));

        await Promise.all(changes.update.map(async (serverFolder) => {
            const localFolder = await FoldersUniversalService.get(serverFolder.id);

            if (localFolder.modifiedTimestamp >= new Date(serverFolder.updateDate).valueOf()) return;

            await FoldersUniversalService
                .save({
                    ...serverFolder,
                    id: serverFolder.id,
                    parentId: serverFolder.parentId,
                    name: serverFolder.name,
                    createTimestamp: new Date(serverFolder.createDate).valueOf(),
                    modifiedTimestamp: new Date(serverFolder.updateDate).valueOf(),
                }, false);
        }));

        await Promise.all(changes.delete.map(async ({ id, updateDate }) => {
            const localFolder = await FoldersUniversalService.get(id);

            if (!localFolder || localFolder.modifiedTimestamp >= new Date(updateDate).valueOf()) return;

            await FoldersUniversalService.remove(id, false);
        }));

        if (changes.create.length + changes.update.length + changes.delete.length !== 0) {
            this.core.globalEventBus.call('folder/new', DESTINATION.APP);
        }
    }

    async grubNotSyncedChanges() {
        console.log('[CloudSync] Grub folders changes...');

        const commits = await db().getAll('folders_wait_sync');

        if (commits.length === 0) {
            console.log('[CloudSync] Nothing folders changes');
            return null;
        }

        const changesItems = commitsToChanged('folderId', commits);

        console.log('folders:', commits, changesItems);

        if ('create' in changesItems) {
            changesItems.create = await Promise.all(
                changesItems.create.map(async ({ folderId, commitDate }) => {
                    const folder = await db().get('folders', folderId);

                    if (!folder) return null;

                    return {
                        id: folder.id,
                        parentId: folder.parentId,
                        name: folder.name,
                        lastAction: 'create',
                        createDate: new Date(folder.createTimestamp).toISOString(),
                        updateDate: commitDate,
                    };
                }),
            );

            changesItems.create = changesItems.create.filter((isExist) => isExist);
        }

        if ('update' in changesItems) {
            changesItems.update = await Promise.all(
                changesItems.update.map(async ({ folderId, commitDate }) => {
                    const folder = await db().get('folders', folderId);

                    if (!folder) return null;

                    return {
                        id: folder.id,
                        parentId: folder.parentId,
                        name: folder.name,
                        lastAction: 'update',
                        createDate: new Date(folder.createTimestamp).toISOString(),
                        updateDate: commitDate,
                    };
                }),
            );

            changesItems.update = changesItems.update.filter((isExist) => isExist);
        }

        if ('delete' in changesItems) {
            changesItems.delete = changesItems.delete.map(({ folderId, commitDate }) => ({
                id: folderId,
                updateDate: commitDate,
            }));
        }

        return changesItems;
    }

    async clearNotSyncedChanges() {
        console.log('[CloudSync] Clear await synced folders changes...');

        await db().clear('folders_wait_sync');
    }
}

export default CloudSyncFoldersService;
