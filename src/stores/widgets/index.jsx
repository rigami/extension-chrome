import { makeAutoObservable } from 'mobx';
import { WidgetsSettingsStore } from '@/stores/app/settings';

class WidgetsService {
    _coreService;
    settings;

    constructor(coreService) {
        makeAutoObservable(this);
        this._coreService = coreService;
        this.settings = new WidgetsSettingsStore();
    }

}

export default WidgetsService;
