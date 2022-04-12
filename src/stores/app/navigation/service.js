import { makeAutoObservable } from 'mobx';
import { NULL_UUID } from '@/utils/generate/uuid';

class NavigationService {
    folderId = NULL_UUID;

    constructor() {
        makeAutoObservable(this);
    }

    setFolder(folderId) {
        this.folderId = folderId;
    }

    resetFolder() {
        this.folderId = NULL_UUID;
    }
}

export default NavigationService;
