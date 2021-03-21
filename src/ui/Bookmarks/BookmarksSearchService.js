import { makeAutoObservable } from 'mobx';
import { SearchQuery } from '@/stores/universal/bookmarks/bookmarks';
import {
    pick,
    assign,
    debounce,
    size,
} from 'lodash';

export const SEARCH_STATE = {
    WAIT: 'WAIT',
    DONE: 'DONE',
    NOT_FOUND: 'NOT_FOUND',
    EMPTY: 'EMPTY',
    PENDING: 'PENDING',
};

class BookmarksSearchService {
    activeFolderId = 1;
    searchEverywhere = false;
    onlyFavorites = false;
    searchRequest = new SearchQuery({});
    state = SEARCH_STATE.WAIT;
    query = '';
    tags = [];
    _applyRequest;
    constructor() {
        makeAutoObservable(this);

        this._applyRequest = debounce(this.applyRequest, 400, { leading: true });
        this.searchRequest = new SearchQuery({
            query: this.query,
            tags: this.tags,
            folderId: !this.searchEverywhere && this.activeFolderId,
            onlyFavorites: this.onlyFavorites,
        });
    }

    setActiveFolder(folderId) {
        this.activeFolderId = folderId;

        this.applyRequest();
    }

    applyRequest() {
        this.searchRequest = new SearchQuery({
            query: this.query,
            tags: this.tags,
            folderId: !this.searchEverywhere && this.activeFolderId,
            onlyFavorites: this.onlyFavorites,
        });
    }

    updateRequest(request) {
        const changeValues = pick(request, [
            'query',
            'tags',
            'searchEverywhere',
            'onlyFavorites',
        ]);
        assign(this, changeValues);
        if (size(changeValues) > 0) this._applyRequest();
    }
}

export default BookmarksSearchService;
