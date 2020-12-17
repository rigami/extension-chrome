import { observable } from 'mobx';
import Background from './background';

class RemoteBackground extends Background{
    @observable originId;
    @observable isSaved;
    @observable loadSrc;
    @observable isLoad;

    constructor(background = {}) {
        super({
            ...background,
            id: `${background.source.toLowerCase()}-${background.id}`,
        });
        this.originId = background.id;
        this.isSaved = background.isSaved || false;
        this.loadSrc = background.loadSrc;
        this.isLoad = background.isLoad || false;
    }
}

export default RemoteBackground;
