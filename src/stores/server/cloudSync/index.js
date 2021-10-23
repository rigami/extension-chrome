import { makeAutoObservable, when } from 'mobx';
import api from '@/utils/helpers/api';
import authStorage from '@/stores/universal/AuthStorage';
import { PersistentStorage } from '@/stores/universal/storage';
import awaitInstallStorage from '@/utils/helpers/awaitInstallStorage';
import setAwaitInterval, { stopAwaitInterval } from '@/utils/helpers/setAwaitInterval';
import CloudSyncBookmarksService from './bookmarks';
import CloudSyncFoldersService from './folders';
import CloudSyncTagsService from './tags';

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

        console.log('response:', statusCode, response);

        if (statusCode === 304) {
            console.log('[CloudSync] Nothing for pull');
            return;
        }

        if (!ok) {
            throw new Error(`Failed pull '${response.message}'`);
        }

        await this.tags.applyChanges(response.tags);
        await this.folders.applyChanges(response.folders);
        await this.bookmarks.applyChanges(response.bookmarks);

        this.storage.update({ localCommit: response.headCommit });
    }

    async pushChanges() {
        console.log('[CloudSync] Grab changes...');

        const tagsChanges = await this.tags.grubNotSyncedChanges();
        const foldersChanges = await this.folders.grubNotSyncedChanges();
        const bookmarksChanges = await this.bookmarks.grubNotSyncedChanges();

        if (!tagsChanges && !foldersChanges && !bookmarksChanges) {
            console.log('[CloudSync] Nothing changes for push...');
            return;
        }

        console.log('[CloudSync] Push changes...', {
            localCommit: this.storage.data?.localCommit,
            bookmarks: bookmarksChanges || {},
            folders: foldersChanges || {},
            tags: tagsChanges || {},
        });

        const { response, ok } = await api.put(
            'sync/push', {
                body: {
                    localCommit: this.storage.data?.localCommit,
                    bookmarks: bookmarksChanges || {},
                    folders: foldersChanges || {},
                    tags: tagsChanges || {},
                },
            },
        );

        console.log('response:', ok, response);

        if (ok) {
            await this.tags.clearNotSyncedChanges();
            await this.folders.clearNotSyncedChanges();
            await this.bookmarks.clearNotSyncedChanges();
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

            if (response.existUpdate) await this.pullChanges(response.fromCommit, response.toCommit);

            this.storage.update({
                requirePullParts: this.storage.data?.requirePullParts.filter((part) => (
                    part.fromCommit !== response.fromCommit
                    && part.toCommit !== response.toCommit
                )),
            });
        }
    }

    runSyncCycle() {
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
            } catch (e) {
                console.error('Failed sync:', e);
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
            this.stopSyncCycle();
            this.storage.update({ localCommit: null });

            if (authStorage.data.username === newUsername) {
                this.runSyncCycle();
            } else {
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
