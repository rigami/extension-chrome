import { action, makeAutoObservable } from 'mobx';
import { assign, pick } from 'lodash';
import FSConnector from '@/utils/fsConnector';
import { BKMS_VARIANT } from '@/enum';

class Bookmark {
    id;
    url;
    name;
    description;
    icoVariant;
    imageUrl;
    imageBase64;
    icoFileName;
    tags;
    folderId;
    clickCounts = 0;
    version = 1;

    constructor(bookmark = {}) {
        makeAutoObservable(this);

        const imageUrl = bookmark.imageUrl || FSConnector.getIconURL(bookmark.icoFileName);

        this.id = bookmark.id;
        this.url = bookmark.url;
        this.name = bookmark.name;
        this.description = bookmark.description || '';
        this.icoVariant = bookmark.icoVariant || BKMS_VARIANT.SYMBOL;
        this.imageUrl = `${imageUrl}?v=${bookmark.version || 1}`;
        this.imageBase64 = bookmark.imageBase64;
        this.tags = bookmark.tags || [];
        this.folderId = bookmark.folderId || null;
        this.icoFileName = bookmark.icoFileName;
        this.version = bookmark.version || 1;

        this.update(bookmark);
    }

    @action
    update(bookmark = {}) {
        assign(this, pick(bookmark, ['clickCounts']));
    }
}

export default Bookmark;
