import { makeAutoObservable } from 'mobx';
import FSConnector from '@/utils/fsConnector';

class Background {
    id;
    fileName;
    author;
    description;
    antiAliasing;
    source;
    sourceLink;
    type;
    previewSrc;
    fullSrc;
    pause = false;

    constructor(background = {}) {
        makeAutoObservable(this);
        this.id = background.id;
        this.fileName = background.fileName;
        this.author = background.author;
        this.description = background.description;
        this.antiAliasing = background.antiAliasing;
        this.source = background.source;
        this.sourceLink = background.sourceLink;
        this.type = background.type;
        this.previewSrc = FSConnector.getBGURL(this.fileName, 'preview');
        this.fullSrc = FSConnector.getBGURL(this.fileName, 'full');
        this.pause = background.pause || false;
    }
}

export default Background;
