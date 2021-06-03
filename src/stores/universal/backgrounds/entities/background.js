import { observable } from 'mobx';
import { BG_SOURCE } from '@/enum';

class Background {
    @observable id;
    @observable originId;
    @observable isSaved;
    @observable isLoad;
    @observable fileName;
    @observable author;
    @observable authorName;
    @observable authorAvatarSrc;
    @observable description;
    @observable antiAliasing;
    @observable source;
    @observable sourceLink;
    @observable downloadLink;
    @observable type;
    @observable previewSrc;
    @observable pauseStubSrc;
    @observable fullSrc;
    @observable pauseTimestamp;

    constructor(background = {}) {
        this.originId = background.originId || background.id;
        this.isSaved = background.isSaved || false;
        this.isLoad = background.isLoad || false;
        this.fileName = background.fileName;
        this.author = background.author;
        this.authorName = background.authorName;
        this.authorAvatarSrc = background.authorAvatarSrc;
        this.description = background.description;
        this.antiAliasing = background.antiAliasing === false ? false : (background.antiAliasing || true);
        this.source = background.source || BG_SOURCE.USER;
        this.id = `${this.source.toLowerCase()}-${this.originId}`;
        this.sourceLink = background.sourceLink;
        this.downloadLink = background.downloadLink;
        this.type = background.type;
        this.previewSrc = background.previewSrc;
        this.pauseStubSrc = background.pauseStubSrc;
        this.fullSrc = background.fullSrc;
        this.pauseTimestamp = background.pauseTimestamp;
    }
}

export default Background;
