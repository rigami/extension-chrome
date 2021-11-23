import { makeAutoObservable, when } from 'mobx';
import api from '@/utils/helpers/api';
import authStorage from '@/stores/universal/AuthStorage';
import { PersistentStorage } from '@/stores/universal/storage';
import awaitInstallStorage from '@/utils/helpers/awaitInstallStorage';
import { setAwaitInterval, stopAwaitInterval } from '@/utils/helpers/setAwaitInterval';
import CloudSyncBookmarksService from './bookmarks';
import CloudSyncFoldersService from './folders';
import CloudSyncTagsService from './tags';
import db from '@/utils/db';
import { DESTINATION } from '@/enum';
import { PREPARE_PROGRESS } from '@/stores/app/core';

const SYNC_STAGE = {
    WAIT: 'WAIT',
    SYNCING_PUSH: 'SYNCING_PUSH',
    SYNCING_PULL: 'SYNCING_PULL',
    SYNCED: 'SYNCED',
    FAILED_SYNC: 'FAILED_SYNC',
};

class CloudSyncService {
    core;
    storage;
    bookmarks;
    folders;
    tags;
    _syncCycle;

    constructor(core) {
        makeAutoObservable(this);
        this.core = core;

        console.log('authStorage.data.username:', authStorage.data.username);

        if (authStorage.data.username) {
            this.subscribe();
        } else {
            when(
                () => authStorage.data.username,
                () => {
                    console.log('when authStorage.data.username:', authStorage.data.username);
                    this.subscribe();
                },
            );
        }
    }

    async checkUpdates() {
        console.log('[CloudSync] Check updates...');

        const { response } = await api.get(
            'sync/check-update',
            { query: { fromCommit: this.storage.data?.localCommit } },
        );

        console.log('response:', response);

        if (!response.existUpdate) {
            console.log('[CloudSync] Nothing for updates');

            return null;
        }

        console.log('Check updates:', response);

        return response.headCommit;
    }

    async pullChanges(fromCommit, toCommit) {
        console.log('[CloudSync] Pull changes...');

        const { response, ok, statusCode } = await api.get('sync/pull', {
            query: {
                fromCommit,
                toCommit,
            },
        });

        console.log('pull response:', statusCode, response);

        if (statusCode === 304) {
            console.log('[CloudSync] Nothing for pull');
            return;
        }

        if (!ok) {
            throw new Error(`Failed pull '${response.message}'`);
        }

        this.storage.update({ stage: SYNC_STAGE.SYNCING_PULL });

        await this.folders.applyChanges(response);
        await this.tags.applyChanges(response);
        await this.bookmarks.applyChanges(response);

        this.storage.update({ localCommit: response.headCommit });
    }

    async pushChanges() {
        console.log('[CloudSync] Grab changes...');

        const commits = await db().getAllFromIndex('pair_with_cloud', 'is_sync', +false);

        console.log('commits:', commits);

        if (commits.length === 0) {
            console.log('[CloudSync] Nothing changes for push');
            return;
        }

        this.storage.update({ stage: SYNC_STAGE.SYNCING_PUSH });

        const foldersChanges = await this.folders.grubChanges(commits.filter(({ entityType }) => entityType === 'folder'));
        const tagsChanges = await this.tags.grubChanges(commits.filter(({ entityType }) => entityType === 'tag'));
        const bookmarksChanges = await this.bookmarks.grubChanges(commits.filter(({ entityType }) => entityType === 'bookmark'));

        const { response, ok } = await api.put(
            'sync/push', {
                body: {
                    localCommit: this.storage.data?.localCommit,
                    create: [...foldersChanges.create, ...tagsChanges.create, ...bookmarksChanges.create],
                    update: [...foldersChanges.update, ...tagsChanges.update, ...bookmarksChanges.update],
                    delete: [...foldersChanges.delete, ...tagsChanges.delete, ...bookmarksChanges.delete],
                },
            },
        );

        console.log('response:', ok, response);

        if (ok) {
            console.log('Pairing entities...');
            for await (const pair of response.pair) {
                const oldPair = await db().get('pair_with_cloud', `${pair.entityType}_${pair.localId}`);

                await db().put('pair_with_cloud', {
                    ...oldPair,
                    cloudId: pair.cloudId,
                    isPair: +true,
                    isSync: +true,
                    isDeleted: +false,
                    modifiedTimestamp: Date.now(),
                });
            }

            await this.folders.applyChanges(response);
            await this.tags.applyChanges(response);
            await this.bookmarks.applyChanges(response);

            this.storage.update({
                localCommit: response.headCommit,
                requirePullParts: [
                    ...(this.storage.data?.requirePullParts || []),
                    {
                        fromCommit: response.fromCommit,
                        toCommit: response.toCommit,
                    },
                ],
            });

            const notModifiedCommits = await db().getAllFromIndex('pair_with_cloud', 'is_sync', +false);

            for await (const notModifiedCommit of notModifiedCommits) {
                if (commits.find(({ entityType_localId }) => entityType_localId === notModifiedCommit.entityType_localId)) {
                    await db().put('pair_with_cloud', {
                        ...notModifiedCommit,
                        isSync: true,
                    });
                }
            }

            if (response.existUpdate) await this.pullChanges(response.fromCommit, response.toCommit);

            this.storage.update({
                requirePullParts: this.storage.data?.requirePullParts.filter((part) => (
                    part.fromCommit !== response.fromCommit
                    && part.toCommit !== response.toCommit
                )),
            });
        } else {
            throw Error(`Failed pull '${response.message}'`);
        }
    }

    runSyncCycle() {
        console.log('[CloudSync] Run sync cycle...');
        this._syncCycle = setAwaitInterval(async () => {
            try {
                await this.pushChanges();

                if (this.storage.data?.requirePullParts && this.storage.data?.requirePullParts.length !== 0) {
                    for await (const pullPart of [...this.storage.data?.requirePullParts]) {
                        await this.pullChanges(pullPart.fromCommit, pullPart.toCommit);
                        this.storage.update({
                            requirePullParts: this.storage.data?.requirePullParts.filter((part) => (
                                part.fromCommit !== pullPart.fromCommit
                                && part.toCommit !== pullPart.toCommit
                            )),
                        });
                    }
                }

                const updates = await this.checkUpdates();
                if (updates) await this.pullChanges(this.storage.data?.localCommit, updates);

                this.storage.update({ stage: SYNC_STAGE.SYNCED });
            } catch (e) {
                console.error('Failed sync:', e);
                this.storage.update({ stage: SYNC_STAGE.FAILED_SYNC });
            }
        }, 10000);
    }

    stopSyncCycle() {
        stopAwaitInterval(this._syncCycle);
    }

    async subscribe() {
        this.storage = new PersistentStorage('cloudSync', (currState) => ({ ...(currState || {}) }));

        await awaitInstallStorage(this.storage);

        this.bookmarks = new CloudSyncBookmarksService(this.core);
        this.folders = new CloudSyncFoldersService(this.core);
        this.tags = new CloudSyncTagsService(this.core);

        this.runSyncCycle();

        this.core.globalEventBus.on('sync/forceSync', async ({ data: newUsername }) => {
            console.log('[CloudSync] Force re sync...');
            this.stopSyncCycle();
            this.storage.update({ localCommit: null });

            console.log('[CloudSync] Reset pairs with cloud...');
            const pairs = await db().getAll('pair_with_cloud');

            for await (const pair of pairs) {
                if (pair.isDeleted) {
                    await db().delete('pair_with_cloud', pair.entityType_localId);
                } else {
                    await db().put('pair_with_cloud', {
                        ...pair,
                        cloudId: null,
                        isSync: +false,
                        isPair: +false,
                    });
                }
            }

            if (authStorage.data.username === newUsername) {
                this.runSyncCycle();
            } else {
                console.log('[CloudSync] Wait login...');
                when(
                    () => authStorage.data.username === newUsername,
                    () => {
                        this.runSyncCycle();
                    },
                );
            }
        });
    }
}

export default CloudSyncService;
