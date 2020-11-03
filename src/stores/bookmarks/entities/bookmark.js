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
    icoFileName;
    categories;
    clickCounts = 0;

    constructor(bookmark = {}) {
        makeAutoObservable(this);
        this.id = bookmark.id;
        this.url = bookmark.url;
        this.name = bookmark.name;
        this.description = bookmark.description || "";
        this.icoVariant = bookmark.icoVariant || BKMS_VARIANT.SYMBOL;
        this.imageUrl = bookmark.imageUrl || FSConnector.getIconURL(bookmark.icoFileName);
        this.categories = bookmark.categories || [];
        this.icoFileName = bookmark.icoFileName;

        this.update(bookmark);
    }

    @action
    update(bookmark = {}) {
        assign(this, pick(bookmark, ['clickCounts']));
    }
}

export default Bookmark;
