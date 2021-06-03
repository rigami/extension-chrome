import { action, makeAutoObservable } from 'mobx';
import { assign, pick } from 'lodash';
import { BKMS_VARIANT } from '@/enum';

class Bookmark {
    id;
    url;
    name;
    description;
    icoVariant;
    icoUrl;
    imageBase64;
    icoFileName;
    tags;
    folderId;
    clickCounts = 0;

    constructor(bookmark = {}) {
        makeAutoObservable(this);

        this.id = bookmark.id;
        this.url = bookmark.url;
        this.name = bookmark.name;
        this.description = bookmark.description || '';
        this.icoVariant = bookmark.icoVariant || BKMS_VARIANT.SYMBOL;
        this.icoUrl = bookmark.icoUrl;
        this.imageBase64 = bookmark.imageBase64;
        this.tags = bookmark.tags || [];
        this.folderId = bookmark.folderId || null;
        this.icoFileName = bookmark.icoFileName;
        this.createTimestamp = bookmark.createTimestamp;
        this.modifiedTimestamp = bookmark.modifiedTimestamp;

        this.update(bookmark);
    }

    @action
    update(bookmark = {}) {
        assign(this, pick(bookmark, ['clickCounts']));
    }
}

export default Bookmark;
