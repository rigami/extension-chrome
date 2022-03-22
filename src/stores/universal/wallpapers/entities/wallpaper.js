import { observable } from 'mobx';
import { BG_SOURCE } from '@/enum';

class Wallpaper {
    @observable id;
    @observable idInSource;
    @observable isSaved;
    @observable isLoad;
    @observable isLiked;
    @observable isDisliked;
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

    constructor(wallpaper = {}) {
        this.idInSource = wallpaper.idInSource;
        this.isSaved = wallpaper.isSaved || false;
        this.isLoad = wallpaper.isLoad || false;
        this.isLiked = wallpaper.isLiked || false;
        this.isDisliked = wallpaper.isDisliked || false;
        this.fileName = wallpaper.fileName;
        this.author = wallpaper.author;
        this.authorName = wallpaper.authorName;
        this.authorAvatarSrc = wallpaper.authorAvatarSrc;
        this.description = wallpaper.description;
        this.antiAliasing = wallpaper.antiAliasing === false ? false : (wallpaper.antiAliasing || true);
        this.source = wallpaper.source || BG_SOURCE.USER;
        this.id = wallpaper.id;
        this.sourceLink = wallpaper.sourceLink;
        this.type = wallpaper.type;
        this.kind = wallpaper.kind;
        this.angle = wallpaper.angle || 0;
        this.colors = wallpaper.colors || [];
        this.contrastColor = wallpaper.contrastColor;
        this.previewSrc = wallpaper.previewSrc;
        this.pauseStubSrc = wallpaper.pauseStubSrc;
        this.fullSrc = wallpaper.fullSrc;
        this.pauseTimestamp = wallpaper.pauseTimestamp;
    }
}

export default Wallpaper;
