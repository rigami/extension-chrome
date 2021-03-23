import { action, makeAutoObservable } from 'mobx';
import { DESTINATION } from '@/enum';
import BookmarksUniversalService from '@/stores/universal/bookmarks/bookmarks';

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
        this._coreService.storage.updatePersistent({ bkmsLastSearch: searchQuery });

        return BookmarksUniversalService.query(searchQuery);
    }

    @action('save bookmarks')
    async save(props) {
        const saveBookmarkId = await BookmarksUniversalService.save(props).catch(console.error);

        this._coreService.globalEventBus.call('bookmark/new', DESTINATION.APP, { bookmarkId: saveBookmarkId });

        return saveBookmarkId;
    }

    @action('remove bookmark')
    async remove(bookmarkId) {
        await BookmarksUniversalService.remove(bookmarkId);

        this._coreService.globalEventBus.call('bookmark/remove', DESTINATION.APP, { bookmarkId });
    }
}

export default BookmarksStore;
