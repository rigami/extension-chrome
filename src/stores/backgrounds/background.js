import { makeAutoObservable } from 'mobx';

class Background {
    id;
    fileName;
    author;
    description;
    antiAliasing;
    source;
    sourceLink;
    type;

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
    }
}

export default Background;
