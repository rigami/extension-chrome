import { makeAutoObservable, toJS } from 'mobx';
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
    searchRequest = new SearchQuery({});
    tempSearchRequest = new SearchQuery({});
    state = SEARCH_STATE.WAIT;
    _temp = {
        query: '',
        tags: [],
    };

    searchRequestId = 0;
    _debounceApplyRequest;

    constructor() {
        makeAutoObservable(this);

        this._debounceApplyRequest = debounce(
            () => this._applyRequest(),
            300,
            { leading: true },
        );
        this.tempSearchRequest = new SearchQuery({
            query: this._temp.query,
            tags: this._temp.tags,
        });
        this.searchRequest = new SearchQuery({
            query: this._temp.query,
            tags: this._temp.tags,
            folderId: this.activeFolderId,
        });
    }

    setActiveFolder(folderId) {
        this.activeFolderId = folderId;

        this.applyChanges();
    }

    _applyRequest() {
        console.log('_applyRequest', toJS(this._temp));
        const searchRequest = new SearchQuery({
            query: this._temp.query,
            tags: this._temp.tags,
        });

        if (!isEqual(searchRequest, this.tempSearchRequest)) {
            this.tempSearchRequest = searchRequest;
        }
    }

    applyChanges() {
        console.log('applyChanges');
        const searchRequest = new SearchQuery({
            query: this._temp.query,
            tags: this._temp.tags,
            folderId: this.activeFolderId,
        });

        if (!isEqual(searchRequest, this.searchRequest)) {
            this.searchRequest = searchRequest;
            this.searchRequestId += 1;
        }
    }

    resetChanges() {
        this._temp = {
            query: this.searchRequest.query,
            tags: this.searchRequest.tags,
        };
        this.tempSearchRequest = new SearchQuery({
            query: this.searchRequest.query,
            tags: this.searchRequest.tags,
            folderId: this.searchRequest.folderId,
        });
    }

    updateRequest(request, { force = false } = {}) {
        console.log('updateRequest', request, { force });
        const changeValues = pick(request, ['query', 'tags']);
        assign(this._temp, changeValues);
        if (size(changeValues) > 0) {
            if (force) this._applyRequest();
            else this._debounceApplyRequest();
        }
    }
}

export default BookmarksSearchService;
