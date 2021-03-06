import { action, makeAutoObservable } from 'mobx';
import { AppSettingsStore } from '@/stores/app/settings';
import WidgetsService from '@/stores/app/widgets';
import BackgroundsService from '@/stores/app/backgrounds';
import { ACTIVITY } from '@/enum';

class AppStateStore {
    coreService;
    activity = ACTIVITY.DESKTOP;
    settings;
    widgets;
    backgrounds;

    constructor({ coreService }) {
        makeAutoObservable(this);
        this.coreService = coreService;
        this.settings = new AppSettingsStore();
        this.widgets = new WidgetsService(coreService);
        this.backgrounds = new BackgroundsService(coreService);

        this.activity = this.settings.defaultActivity;
    }

    @action('set activity')
    setActivity(activity) {
        this.activity = activity;
    }

    @action('open context menu')
    contextMenu(computeActions, { useAnchorEl = false, reactions } = {}) {
        return (event) => {
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
                actions: () => computeActions().filter((isExist) => isExist),
                position,
                reactions,
            });
        };
    }
}

export default AppStateStore;
