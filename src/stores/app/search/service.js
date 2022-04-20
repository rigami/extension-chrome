import { makeAutoObservable, toJS } from 'mobx';
import {
    pick,
    assign,
    debounce,
    size,
    isEqual,
} from 'lodash';
import { SearchQuery } from '@/stores/universal/workingSpace/search';
import { NULL_UUID } from '@/utils/generate/uuid';

export const SEARCH_STATE = {
    WAIT: 'WAIT',
    DONE: 'DONE',
    NOT_FOUND: 'NOT_FOUND',
    EMPTY: 'EMPTY',
    PENDING: 'PENDING',
};

class SearchService {
    activeFolderId = null;
    selectFolderId = NULL_UUID; // Used
    searchRequest = null;
    tempSearchRequest = new SearchQuery({});
    isSearching = false;
    state = SEARCH_STATE.WAIT;
    _temp = {
        query: '',
        tags: [],
        folderId: NULL_UUID,
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
            folderId: this._temp.folderId,
        });
        this.searchRequest = new SearchQuery({
            query: this._temp.query,
            tags: this._temp.tags,
            folderId: this._temp.folderId,
        });
    }

    _applyRequest() {
        console.log('_applyRequest', toJS(this._temp));
        const searchRequest = new SearchQuery({
            query: this._temp.query,
            tags: this._temp.tags,
            folderId: this._temp.folderId,
        });

        if (!isEqual(searchRequest, this.tempSearchRequest)) {
            this.tempSearchRequest = searchRequest;
        }
    }

    applyChanges() {
        console.log('applyChanges');
        this.searchRequest = new SearchQuery({
            query: this._temp.query,
            tags: this._temp.tags,
            folderId: this._temp.folderId,
        });
        this.searchRequestId += 1;

        this._temp = {
            query: '',
            tags: [],
            folderId: NULL_UUID,
        };
        this.tempSearchRequest = new SearchQuery({
            query: this._temp.query,
            tags: this._temp.tags,
            folderId: this._temp.folderId,
        });

        this.isSearching = true;
    }

    resetChanges() {
        this._temp = {
            query: '',
            tags: [],
            folderId: NULL_UUID,
        };
        this.tempSearchRequest = new SearchQuery({
            query: this._temp.query,
            tags: this._temp.tags,
            folderId: this._temp.folderId,
        });
        this.searchRequest = null;
        this.isSearching = false;
    }

    updateRequest(request, { force = false } = {}) {
        console.log('updateRequest', request, { force });
        const changeValues = pick(request, ['query', 'tags', 'folderId']);
        assign(this._temp, changeValues);
        if (size(changeValues) > 0) {
            if (force) this._applyRequest();
            else this._debounceApplyRequest();
        }
    }
}

export default SearchService;
