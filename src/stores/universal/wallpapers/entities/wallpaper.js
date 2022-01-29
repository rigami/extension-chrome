import { observable } from 'mobx';
import { BG_SOURCE } from '@/enum';

class Wallpaper {
    @observable id;
    @observable idInSource;
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
    @observable type;
    @observable kind;
    @observable angle;
    @observable colors;
    @observable contrastColor;
    @observable previewSrc;
    @observable pauseStubSrc;
    @observable fullSrc;
    @observable pauseTimestamp;

    constructor(background = {}) {
        this.idInSource = background.idInSource;
        this.isSaved = background.isSaved || false;
        this.isLoad = background.isLoad || false;
        this.fileName = background.fileName;
        this.author = background.author;
        this.authorName = background.authorName;
        this.authorAvatarSrc = background.authorAvatarSrc;
        this.description = background.description;
        this.antiAliasing = background.antiAliasing === false ? false : (background.antiAliasing || true);
        this.source = background.source || BG_SOURCE.USER;
        this.id = background.id;
        this.sourceLink = background.sourceLink;
        this.type = background.type;
        this.kind = background.kind;
        this.angle = background.angle || 0;
        this.colors = background.colors || [];
        this.contrastColor = background.contrastColor;
        this.previewSrc = background.previewSrc;
        this.pauseStubSrc = background.pauseStubSrc;
        this.fullSrc = background.fullSrc;
        this.pauseTimestamp = background.pauseTimestamp;
    }
}

export default Wallpaper;
