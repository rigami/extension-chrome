import { makeAutoObservable, reaction, when } from 'mobx';
import api from '@/utils/helpers/api';
import db from '@/utils/db';
import {
    pickBy,
    first,
    last,
    mapValues,
    each,
} from 'lodash';
import authStorage from '@/stores/universal/AuthStorage';
import { PersistentStorage } from '@/stores/universal/storage';
import awaitInstallStorage from '@/utils/helpers/awaitInstallStorage';
import timeout from '@/utils/helpers/timeout';
import BookmarksUniversalService from '@/stores/universal/bookmarks/bookmarks';
import { captureException } from '@sentry/react';
import { DESTINATION } from '@/enum';
import setAwaitInterval from '@/utils/helpers/setAwaitInterval';

class CloudSyncService {
    core;
    storage;

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
            'bookmarks/state/check-update',
            { query: { commit: this.storage.data?.bookmarks } },
        );

        console.log('response:', response);

        if (!response.existUpdate) {
            if (!this.storage.data?.bookmarks) {
                console.log('[CloudSync] Not set local commit. Save server commit...');
                this.storage.update({ bookmarks: response.serverCommit });
            }

            console.log('[CloudSync] Nothing for updates');

            return null;
        }

        console.log('Check updates:', response);

        return this.pullChanges(this.storage.data?.bookmarks, response.serverCommit);
    }

    async pullChanges(localCommit, serverCommit) {
        console.log('[CloudSync] Pull changes...');

        const { response, ok } = await api.get('bookmarks/state/pull', { query: { commit: localCommit } });

        console.log('response:', response);

        if (response.length === 0) {
            console.log('[CloudSync] Nothing for pull');
        }

        if (!ok) {
            throw new Error(`Failed pull '${response.message}'`);
        }

        await Promise.all(response.create.map((bookmark) => BookmarksUniversalService
            .save({
                ...bookmark,
                id: bookmark.id,
                icoVariant: bookmark.variant.toUpperCase(),
                url: bookmark.url,
                icoUrl: bookmark.imageUrl || '',
                name: bookmark.title,
                description: bookmark.description,
                tags: bookmark.tagsIds,
                folderId: bookmark.folderId,
                createTimestamp: new Date(bookmark.createDate).valueOf(),
                modifiedTimestamp: new Date(bookmark.updateDate).valueOf(),
            }, false)));

        await Promise.all(response.update.map((bookmark) => BookmarksUniversalService
            .save({
                ...bookmark,
                id: bookmark.id,
                icoVariant: bookmark.variant.toUpperCase(),
                url: bookmark.url,
                icoUrl: bookmark.imageUrl || '',
                name: bookmark.title,
                description: bookmark.description,
                tags: bookmark.tagsIds,
                folderId: bookmark.folderId,
                createTimestamp: new Date(bookmark.createDate).valueOf(),
                modifiedTimestamp: new Date(bookmark.updateDate).valueOf(),
            }, false)));

        await Promise.all(response.delete.map((bookmarkId) => BookmarksUniversalService
            .remove(bookmarkId, false)));

        this.storage.update({ bookmarks: serverCommit });

        if (response.create.length + response.update.length + response.delete.length !== 0) {
            this.core.globalEventBus.call('bookmark/new', DESTINATION.APP);
        }
    }

    async pushChanges() {
        console.log('[CloudSync] Grab changes...');
        const commits = await db().getAll('bookmarks_wait_sync');

        if (commits.length === 0) {
            console.log('[CloudSync] Nothing for push');
            return;
        }

        let changesItems = {};
        commits.forEach((commit) => {
            changesItems[commit.bookmarkId] = [
                ...(changesItems[commit.bookmarkId] || []),
                {
                    action: commit.action,
                    commitDate: commit.commitDate,
                },
            ];
        });
        console.log('changesItems:', changesItems);

        changesItems = pickBy(changesItems, (actions) => (
            actions.length === 1
            || first(actions).action !== 'create'
            || last(actions).action !== 'delete'
        ));

        changesItems = mapValues(changesItems, (actions) => last(actions));

        const changesItemsByActions = {};

        each(changesItems, ({ action, commitDate }, bookmarkId) => {
            changesItemsByActions[action] = [
                ...(changesItemsByActions[action] || []),
                {
                    bookmarkId,
                    commitDate,
                },
            ];
        });

        if ('create' in changesItemsByActions) {
            changesItemsByActions.create = await Promise.all(
                changesItemsByActions.create.map(async ({ bookmarkId, commitDate }) => {
                    const bookmark = await db().get('bookmarks', bookmarkId);

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

            console.log('changesItemsByActions.create:', changesItemsByActions.create);
        }

        if ('update' in changesItemsByActions) {
            changesItemsByActions.update = await Promise.all(
                changesItemsByActions.update.map(async ({ bookmarkId, commitDate }) => {
                    const bookmark = await db().get('bookmarks', bookmarkId);

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

            console.log('changesItemsByActions.update:', changesItemsByActions.update);
        }

        if ('delete' in changesItemsByActions) {
            changesItemsByActions.delete = changesItemsByActions.delete.map(({ bookmarkId, commitDate }) => ({
                id: bookmarkId,
                updateDate: commitDate,
            }));

            console.log('changesItemsByActions.update:', changesItemsByActions.update);
        }

        console.log('changesItems:', changesItemsByActions);

        console.log('[CloudSync] Push changes...', this.storage.data);

        const { response, ok } = await api.put(
            'bookmarks/state/push', {
                body: {
                    // commit: this.storage.data?.bookmarks,
                    ...changesItemsByActions,
                },
            },
        );

        console.log('response:', ok, response);

        if (ok) {
            await db().clear('bookmarks_wait_sync');
            // if (response.serverCommit) this.storage.update({ bookmarks: response.serverCommit });
        }
    }

    async subscribe() {
        this.storage = new PersistentStorage('cloudSync', (currState) => ({ ...(currState || {}) }));

        await awaitInstallStorage(this.storage);

        setAwaitInterval(async () => {
            try {
                if (this.storage.data?.bookmarks) await this.pushChanges();
                await this.checkUpdates();
            } catch (e) {
                console.error('Failed sync:', e);
            }
        }, 3000);
    }
}

export default CloudSyncService;
