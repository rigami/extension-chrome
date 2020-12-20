import { makeAutoObservable } from 'mobx';

class BookmarksService {
    core;

    constructor(core) {
        makeAutoObservable(this);
        this.core = core;
    }
}

export default BookmarksService;
