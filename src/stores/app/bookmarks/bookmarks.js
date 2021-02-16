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

    @action('get bookmark')
    async get(bookmarkId) {
        return BookmarksUniversalService.get(bookmarkId);
    }

    @action('query bookmarks')
    async query(searchQuery = {}, notSaveSearch = true) {
        if (!notSaveSearch) {
            this._coreService.storage.updatePersistent({ bkmsLastSearch: searchQuery });
        }

        return BookmarksUniversalService.query(searchQuery);
    }

    @action('save bookmarks')
    async save(props, pushEvent = true) {
        const saveBookmarkId = await BookmarksUniversalService.save(props);

        if (this._coreService && pushEvent) {
            this._coreService.globalEventBus.call('bookmark/new', DESTINATION.APP, { bookmarkId: saveBookmarkId });
        }

        return saveBookmarkId;
    }

    @action('remove bookmark')
    async remove(bookmarkId) {
        await BookmarksUniversalService.remove(bookmarkId);

        if (this._coreService) {
            this._coreService.globalEventBus.call('bookmark/remove', DESTINATION.APP, { bookmarkId });
        }
    }
}

export default BookmarksStore;
