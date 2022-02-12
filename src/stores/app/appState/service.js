import { action, makeAutoObservable } from 'mobx';
import AppSettings from '@/stores/universal/settings/app';
import WidgetsService from '@/stores/app/widgetsService';
import WallpapersService from '@/stores/app/wallpapersService';
import { ACTIVITY, SERVICE_STATE } from '@/enum';
import awaitInstallStorage from '@/utils/helpers/awaitInstallStorage';
import PersistentStorage from '@/stores/universal/storage/persistent';
import DesktopService from '@/stores/app/desktopService';
import settingsStorage from '@/stores/universal/settings/rootSettings';

class AppStateService {
    coreService;
    activity = ACTIVITY.DESKTOP;
    settings;
    cloudSync;
    widgetsService;
    wallpapersService;
    desktopService;
    state = SERVICE_STATE.WAIT;

    constructor({ coreService }) {
        makeAutoObservable(this);
        this.coreService = coreService;
        this.settings = new AppSettings();
        this.cloudSync = new PersistentStorage('cloudSync', (currState) => ({ ...(currState || {}) }));
        this.widgetsService = new WidgetsService(coreService);
        this.wallpapersService = new WallpapersService(coreService);
        this.desktopService = new DesktopService(coreService);

        this.subscribe();
    }

    @action('set activity')
    setActivity(activity) {
        this.activity = activity;
    }

    @action('open context menu')
    contextMenu(computeActions, { useAnchorEl = false, reactions } = {}) {
        return (event) => {
            event.stopPropagation();
            event.preventDefault();

            let position = {
                top: event.nativeEvent.clientY,
                left: event.nativeEvent.clientX,
            };

            if (useAnchorEl) {
                const { top, left } = event.currentTarget.getBoundingClientRect();
                position = {
                    top,
                    left,
                };
            }

            this.coreService.localEventBus.call('system/contextMenu', {
                actions: () => computeActions(event).filter((isExist) => isExist),
                position,
                reactions,
            });
        };
    }

    async subscribe() {
        console.time('Await install settings services');
        console.log('Await install services...');
        this.state = SERVICE_STATE.INSTALL;
        await awaitInstallStorage(this.cloudSync);
        await awaitInstallStorage(settingsStorage);

        this.activity = this.settings.defaultActivity || ACTIVITY.DESKTOP;
        this.state = SERVICE_STATE.DONE;
        console.log('App all services is install');
        console.timeEnd('Await install settings services');
    }
}

export default AppStateService;
