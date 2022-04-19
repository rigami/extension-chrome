import { computed } from 'mobx';

export const COMPARE = {
    FULL: 'FULL',
    PART: 'PART',
    INDIRECTLY: 'INDIRECTLY',
    NONE: 'NONE',
    IGNORE: 'IGNORE',
};

export class SearchQuery {
    tags = [];
    folderId = null;
    query = '';
    onlyFavorites = false;
    _draftRequest;

    constructor(request = {}) {
        this._draftRequest = request;
        if ('tags' in request) this.tags = request.tags;
        if ('folderId' in request) this.folderId = request.folderId;
        if ('query' in request) this.query = request.query.toLowerCase();
        if ('onlyFavorites' in request) this.onlyFavorites = request.onlyFavorites;
    }

    @computed
    get searchEverywhere() {
        return !this.folderId;
    }

    @computed
    get usedFields() {
        return {
            tags: this.tags.length !== 0,
            folder: !!this.folderId,
            query: this.query.length !== 0,
            onlyFavorites: 'onlyFavorites' in this._draftRequest,
        };
    }
}
