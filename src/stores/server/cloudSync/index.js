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

        const { response } = await api.get('bookmarks/state/pull', { query: { commit: localCommit } });

        console.log('response:', response);

        if (response.length === 0) {
            console.log('[CloudSync] Nothing for pull');
            return;
        }

        await Promise.all(response.map((bookmark) => BookmarksUniversalService
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
            })));

        this.storage.update({ bookmarks: serverCommit });

        this.core.globalEventBus.call('bookmark/new', DESTINATION.APP);
    }

    async pushChanges() {
        console.log('[CloudSync] Grab changes...');
        const commits = await db().getAll('bookmarks_wait_sync');

        if (commits.length === 0) {
            console.log('[CloudSync] Nothing for push');
            return;
        }

        await db().clear('bookmarks_wait_sync');

        let changesItems = {};
        commits.forEach((commit) => {
            changesItems[commit.bookmarkId] = [...(changesItems[commit.bookmarkId] || []), commit.action];
        });
        console.log('changesItems:', changesItems);

        changesItems = pickBy(changesItems, (actions) => (
            actions.length === 1
            || first(actions) !== 'create'
            || last(actions) !== 'delete'
        ));

        changesItems = mapValues(changesItems, (actions) => last(actions));

        const changesItemsByActions = {};

        each(changesItems, (action, bookmarkId) => {
            changesItemsByActions[action] = [...(changesItemsByActions[action] || []), bookmarkId];
        });

        if ('create' in changesItemsByActions) {
            changesItemsByActions.create = await Promise.all(
                changesItemsByActions.create.map((bookmarkId) => db().get('bookmarks', bookmarkId)),
            );

            console.log('changesItemsByActions.create:', changesItemsByActions.create);

            changesItemsByActions.create = changesItemsByActions.create.map((bookmark) => ({
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
                updateDate: new Date(bookmark.modifiedTimestamp).toISOString(),
            }));
        }

        if ('update' in changesItemsByActions) {
            changesItemsByActions.update = await Promise.all(
                changesItemsByActions.update.map((bookmarkId) => db().get('bookmarks', bookmarkId)),
            );

            console.log('changesItemsByActions.update:', changesItemsByActions.update);

            changesItemsByActions.update = changesItemsByActions.update.map((bookmark) => ({
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
                updateDate: new Date(bookmark.modifiedTimestamp).toISOString(),
            }));
        }

        console.log('changesItems:', changesItemsByActions);

        console.log('[CloudSync] Push changes...', this.storage.data);

        const { response } = await api.put(
            'bookmarks/state/push', {
                body: {
                    commit: this.storage.data?.bookmarks,
                    ...changesItemsByActions,
                },
            },
        );

        console.log('response:', response);

        if (response.serverCommit) this.storage.update({ bookmarks: response.serverCommit });
    }

    async subscribe() {
        this.storage = new PersistentStorage('cloudSync', (currState) => ({ ...(currState || {}) }));

        await awaitInstallStorage(this.storage);

        setInterval(async () => {
            await this.checkUpdates();
            await this.pushChanges();
        }, 10000);
    }
}

export default CloudSyncService;
