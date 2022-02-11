import { makeAutoObservable, reaction } from 'mobx';
import awaitInstallStorage from '@/utils/helpers/awaitInstallStorage';
import DesktopSettings from '@/stores/universal/settings/desktop';
import { BKMS_FAP_STYLE } from '@/enum';

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
        await awaitInstallStorage(this.settings);
    }
}

export default DesktopService;
