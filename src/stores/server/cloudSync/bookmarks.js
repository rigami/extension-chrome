import { makeAutoObservable } from 'mobx';
import BookmarksUniversalService from '@/stores/universal/bookmarks/bookmarks';
import db from '@/utils/db';
import commitsToChanged from '@/stores/server/cloudSync/utils/commitsToChanged';
import { DESTINATION } from '@/enum';

class CloudSyncBookmarksService {
    core;
    storage;

    constructor(core) {
        makeAutoObservable(this);
        this.core = core;
    }

    async applyChanges(changes) {
        console.log('[CloudSync] Apply bookmarks updates...');

        await Promise.all(changes.create.map((serverBookmark) => BookmarksUniversalService
            .save({
                ...serverBookmark,
                id: serverBookmark.id,
                icoVariant: serverBookmark.variant.toUpperCase(),
                url: serverBookmark.url,
                icoUrl: serverBookmark.imageUrl || '',
                name: serverBookmark.title,
                description: serverBookmark.description,
                tags: serverBookmark.tagsIds,
                folderId: serverBookmark.folderId,
                createTimestamp: new Date(serverBookmark.createDate).valueOf(),
                modifiedTimestamp: new Date(serverBookmark.updateDate).valueOf(),
            }, false)));

        await Promise.all(changes.update.map(async (serverBookmark) => {
            const localBookmark = await BookmarksUniversalService.get(serverBookmark.id);

            if (localBookmark.modifiedTimestamp >= new Date(serverBookmark.updateDate).valueOf()) return;

            await BookmarksUniversalService
                .save({
                    ...serverBookmark,
                    id: serverBookmark.id,
                    icoVariant: serverBookmark.variant.toUpperCase(),
                    url: serverBookmark.url,
                    icoUrl: serverBookmark.imageUrl || '',
                    name: serverBookmark.title,
                    description: serverBookmark.description,
                    tags: serverBookmark.tagsIds,
                    folderId: serverBookmark.folderId,
                    createTimestamp: new Date(serverBookmark.createDate).valueOf(),
                    modifiedTimestamp: new Date(serverBookmark.updateDate).valueOf(),
                }, false);
        }));

        await Promise.all(changes.delete.map(async ({ id, updateDate }) => {
            const localBookmark = await BookmarksUniversalService.get(id);

            if (!localBookmark || localBookmark.modifiedTimestamp >= new Date(updateDate).valueOf()) return;

            await BookmarksUniversalService.remove(id, false);
        }));

        if (changes.create.length + changes.update.length + changes.delete.length !== 0) {
            this.core.globalEventBus.call('bookmark/new', DESTINATION.APP);
        }
    }

    async grubNotSyncedChanges() {
        console.log('[CloudSync] Grub bookmarks changes...');

        const isExistUpdates = await db().count('bookmarks_wait_sync');

        if (isExistUpdates === 0) {
            console.log('[CloudSync] Nothing bookmarks changes');
            return null;
        }

        const commits = await db().getAll('bookmarks_wait_sync');

        const changesItems = commitsToChanged('bookmarkId', commits);

        if ('create' in changesItems) {
            changesItems.create = await Promise.all(
                changesItems.create.map(async ({ bookmarkId, commitDate }) => {
                    const bookmark = await db().get('bookmarks', bookmarkId);

                    if (!bookmark) return null;

                    return {
                        id: bookmark.id,
                        variant: bookmark.icoVariant?.toLowerCase() || 'symbol',
                        url: bookmark.url,
                        imageUrl: bookmark.icoUrl || '',
                        title: bookmark.name,
                        description: bookmark.description,
                        tagsIds: bookmark.tags,
                        folderId: bookmark.folderId,
                        lastAction: 'create',
                        createDate: new Date(bookmark.createTimestamp).toISOString(),
                        updateDate: commitDate,
                    };
                }),
            );

            changesItems.create = changesItems.create.filter((isExist) => isExist);
        }

        if ('update' in changesItems) {
            changesItems.update = await Promise.all(
                changesItems.update.map(async ({ bookmarkId, commitDate }) => {
                    const bookmark = await db().get('bookmarks', bookmarkId);

                    if (!bookmark) return null;

                    return {
                        id: bookmark.id,
                        variant: bookmark.icoVariant?.toLowerCase() || 'symbol',
                        url: bookmark.url,
                        imageUrl: bookmark.icoUrl || '',
                        title: bookmark.name,
                        description: bookmark.description,
                        tagsIds: bookmark.tags,
                        folderId: bookmark.folderId,
                        lastAction: 'update',
                        createDate: new Date(bookmark.createTimestamp).toISOString(),
                        updateDate: commitDate,
                    };
                }),
            );

            changesItems.update = changesItems.update.filter((isExist) => isExist);
        }

        if ('delete' in changesItems) {
            changesItems.delete = changesItems.delete.map(({ bookmarkId, commitDate }) => ({
                id: bookmarkId,
                updateDate: commitDate,
            }));
        }

        return changesItems;
    }

    async clearNotSyncedChanges() {
        console.log('[CloudSync] Clear await synced folders changes...');

        await db().clear('bookmarks_wait_sync');
    }
}

export default CloudSyncBookmarksService;
