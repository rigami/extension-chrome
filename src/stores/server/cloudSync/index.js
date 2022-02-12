import { makeAutoObservable, when } from 'mobx';
import api from '@/utils/helpers/api';
import authStorage from '@/stores/universal/storage/auth';
import PersistentStorage from '@/stores/universal/storage/persistent';
import awaitInstallStorage from '@/utils/helpers/awaitInstallStorage';
import { setAwaitInterval, stopAwaitInterval } from '@/utils/helpers/setAwaitInterval';
import CloudSyncBookmarksService from './bookmarks';
import CloudSyncFoldersService from './folders';
import CloudSyncTagsService from './tags';
import CloudSyncFavoritesService from './favorites';
import CloudSyncSettingsService from '@/stores/server/cloudSync/settings';
import db from '@/utils/db';
import { CLOUD_SYNC } from '@/enum';

class CloudSyncService {
    core;
    storage;
    bookmarks;
    folders;
    tags;
    favorites;
    settings;
    _syncCycle;

    constructor(core) {
        makeAutoObservable(this);
        this.core = core;

        console.log('authStorage.data.authToken:', authStorage.data);

        if (authStorage.data.authToken) {
            this.subscribe();
        } else {
            when(
                () => authStorage.data.authToken,
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

        this.storage.update({ stage: CLOUD_SYNC.SYNCING_PULL });

        await this.folders.applyChanges(response);
        await this.tags.applyChanges(response);
        await this.bookmarks.applyChanges(response);
        await this.favorites.applyChanges(response);
        await this.settings.applyChanges(response);

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

        this.storage.update({ stage: CLOUD_SYNC.SYNCING_PUSH });

        const foldersChanges = await this.folders.grubChanges(commits.filter(({ entityType }) => entityType === 'folder'));
        const tagsChanges = await this.tags.grubChanges(commits.filter(({ entityType }) => entityType === 'tag'));
        const bookmarksChanges = await this.bookmarks.grubChanges(commits.filter(({ entityType }) => entityType === 'bookmark'));
        const favoritesChanges = await this.favorites.grubChanges(commits.filter(({ entityType }) => entityType === 'favorite'));
        const settingsChanges = await this.settings.grubChanges(commits.filter(({ entityType }) => entityType === 'setting'));

        const { response, ok } = await api.put(
            'sync/push', {
                body: {
                    localCommit: this.storage.data?.localCommit,
                    create: [
                        ...foldersChanges.create,
                        ...tagsChanges.create,
                        ...bookmarksChanges.create,
                        ...favoritesChanges.create,
                        ...settingsChanges.create,
                    ],
                    update: [
                        ...foldersChanges.update,
                        ...tagsChanges.update,
                        ...bookmarksChanges.update,
                        ...favoritesChanges.update,
                        ...settingsChanges.update,
                    ],
                    delete: [
                        ...foldersChanges.delete,
                        ...tagsChanges.delete,
                        ...bookmarksChanges.delete,
                        ...favoritesChanges.delete,
                        ...settingsChanges.delete,
                    ],
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
            await this.favorites.applyChanges(response);
            await this.settings.applyChanges(response);

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

                this.storage.update({ stage: CLOUD_SYNC.SYNCED });
            } catch (e) {
                console.error('Failed sync:', e);
                this.storage.update({ stage: CLOUD_SYNC.FAILED_SYNC });
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
        this.favorites = new CloudSyncFavoritesService(this.core);
        this.settings = new CloudSyncSettingsService(this.core);

        this.runSyncCycle();

        this.core.globalEventBus.on('sync/forceSync', async ({ data: newAuthToken }) => {
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

            if (authStorage.data.authToken === newAuthToken) {
                this.runSyncCycle();
            } else {
                console.log('[CloudSync] Wait login...');
                when(
                    () => authStorage.data.authToken === newAuthToken,
                    () => {
                        this.runSyncCycle();
                    },
                );
            }
        });
    }
}

export default CloudSyncService;
