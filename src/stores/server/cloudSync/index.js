import { makeAutoObservable, when } from 'mobx';
import api from '@/utils/helpers/api';
import authStorage from '@/stores/universal/AuthStorage';
import { PersistentStorage } from '@/stores/universal/storage';
import awaitInstallStorage from '@/utils/helpers/awaitInstallStorage';
import { DESTINATION } from '@/enum';
import setAwaitInterval from '@/utils/helpers/setAwaitInterval';
import CloudSyncBookmarksService from './bookmarks';
import CloudSyncFoldersService from './folders';
import CloudSyncTagsService from './tags';

class CloudSyncService {
    core;
    storage;
    bookmarks;
    folders;
    tags;

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
            { query: { commit: this.storage.data?.commit } },
        );

        console.log('response:', response);

        if (!response.existUpdate) {
            console.log('[CloudSync] Nothing for updates');

            return null;
        }

        console.log('Check updates:', response);

        return response.serverCommit;
    }

    async pullChanges(localCommit, serverCommit) {
        console.log('[CloudSync] Pull changes...');

        const { response, ok, statusCode } = await api.get('sync/pull', { query: { commit: localCommit } });

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

        this.storage.update({ commit: serverCommit });

        if (response.create.length + response.update.length + response.delete.length !== 0) {
            this.core.globalEventBus.call('bookmark/new', DESTINATION.APP);
        }
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
            commit: this.storage.data?.commit,
            bookmarks: bookmarksChanges || {},
            folders: foldersChanges || {},
            tags: tagsChanges || {},
        });

        const { response, ok } = await api.put(
            'sync/push', {
                body: {
                    commit: this.storage.data?.commit,
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
            if (response.serverCommit) this.storage.update({ commit: response.serverCommit });
        }
    }

    async subscribe() {
        this.storage = new PersistentStorage('cloudSync', (currState) => ({ ...(currState || {}) }));

        await awaitInstallStorage(this.storage);

        this.bookmarks = new CloudSyncBookmarksService(this.core);
        this.folders = new CloudSyncFoldersService(this.core);
        this.tags = new CloudSyncTagsService(this.core);

        setAwaitInterval(async () => {
            try {
                const updates = await this.checkUpdates();
                if (updates) await this.pullChanges(this.storage.data?.commit, updates);
                await this.pushChanges();
            } catch (e) {
                console.error('Failed sync:', e);
            }
        }, 10000);
    }
}

export default CloudSyncService;
