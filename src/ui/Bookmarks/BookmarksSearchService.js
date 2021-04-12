import { makeAutoObservable } from 'mobx';
import { SearchQuery } from '@/stores/universal/bookmarks/searchQuery';
import {
    pick,
    assign,
    debounce,
    size,
    isEqual,
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
    searchRequestId = 0;
    tempSearchRequestId = 0;
    _applyRequest;
    constructor() {
        makeAutoObservable(this);

        this._applyRequest = debounce(
            (incrementId) => this.applyRequest(incrementId),
            300,
            { leading: true },
        );
        this.searchRequest = new SearchQuery({
            query: this.query,
            tags: this.tags,
            folderId: !this.searchEverywhere && this.activeFolderId,
            onlyFavorites: this.onlyFavorites,
        });
    }

    setActiveFolder(folderId) {
        this.activeFolderId = folderId;

        this.applyRequest(true);
    }

    applyRequest(incrementId = false) {
        const searchRequest = new SearchQuery({
            query: this.query,
            tags: this.tags,
            folderId: !this.searchEverywhere && this.activeFolderId,
            onlyFavorites: this.onlyFavorites,
        });

        if (!isEqual(searchRequest, this.searchRequest)) {
            this.searchRequest = searchRequest;

            if (incrementId) {
                this.searchRequestId += 1;
            }
        }
    }

    updateRequest(request, { force = false, incrementId = false } = {}) {
        const changeValues = pick(request, [
            'query',
            'tags',
            'searchEverywhere',
            'onlyFavorites',
        ]);
        console.log(changeValues);
        assign(this, changeValues);
        if (size(changeValues) > 0) {
            if (force) this.applyRequest(incrementId);
            else this._applyRequest(incrementId);
        }
    }
}

export default BookmarksSearchService;
