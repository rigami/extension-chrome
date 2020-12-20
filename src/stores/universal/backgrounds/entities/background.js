import { observable } from 'mobx';
import FSConnector from '@/utils/fsConnector';
import { BG_SOURCE } from '@/enum';

class Background {
    @observable id;
    @observable originId;
    @observable isSaved;
    @observable isLoad;
    @observable fileName;
    @observable author;
    @observable description;
    @observable antiAliasing;
    @observable source;
    @observable sourceLink;
    @observable downloadLink;
    @observable type;
    @observable previewSrc;
    @observable fullSrc;
    @observable pause = false;

    constructor(background = {}) {
        this.originId = background.id;
        this.isSaved = background.isSaved || false;
        this.isLoad = background.isLoad || false;
        this.fileName = background.fileName;
        this.author = background.author;
        this.description = background.description;
        this.antiAliasing = background.antiAliasing === false ? false : (background.antiAliasing || true);
        this.source = background.source || BG_SOURCE.USER;
        this.id = `${this.source.toLowerCase()}-${this.originId}`;
        this.sourceLink = background.sourceLink;
        this.downloadLink = background.downloadLink;
        this.type = background.type;
        this.previewSrc = this.fileName && FSConnector.getBGURL(this.fileName, 'preview');
        this.fullSrc = this.fileName && FSConnector.getBGURL(this.fileName, 'full');
        this.pause = background.pause || false;
    }
}

export default Background;
