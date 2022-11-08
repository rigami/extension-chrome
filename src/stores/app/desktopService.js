import { makeAutoObservable } from 'mobx';
import awaitInstallStorage from '@/utils/helpers/awaitInstallStorage';
import DesktopSettings from '@/stores/universal/settings/desktop';
import settingsStorage from '@/stores/universal/settings/rootSettings';

class DesktopService {
    _coreService;
    settings;
    storage;
    connector;

    constructor(coreService) {
        makeAutoObservable(this);
        this._coreService = coreService;
        this.settings = new DesktopSettings();
        this.storage = this._coreService.storage;

        this.subscribe();
    }

    async subscribe() {
        await awaitInstallStorage(settingsStorage);
    }
}

export default DesktopService;
