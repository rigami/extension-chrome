import { action, makeAutoObservable } from 'mobx';
import { captureException } from '@sentry/react';
import { DESTINATION } from '@/enum';
import BookmarksUniversalService from '@/stores/universal/workingSpace/bookmarks';
import { search } from '@/stores/universal/workingSpace/search';

class BookmarksStore {
    _coreService;
    _globalService;

    constructor(coreService, globalService) {
        makeAutoObservable(this);
        this._coreService = coreService;
        this._globalService = globalService;
    }

    @action('query bookmarks')
    async query(searchQuery = {}) {
        this._coreService.storage.update({ bkmsLastSearch: searchQuery });

        return search(searchQuery);
    }

    @action('save bookmarks')
    async save(props) {
        const saveBookmarkId = await BookmarksUniversalService
            .save(props)
            .catch((e) => {
                console.error(e);
                captureException(e);
            });

        this._coreService.globalEventBus.call('bookmark/new', DESTINATION.APP, { bookmarkId: saveBookmarkId });

        return saveBookmarkId;
    }

    @action('remove bookmark')
    async remove(bookmarkId) {
        await BookmarksUniversalService.remove(bookmarkId);

        this._coreService.globalEventBus.call('bookmark/removed', DESTINATION.APP, { bookmarkId });
    }
}

export default BookmarksStore;
