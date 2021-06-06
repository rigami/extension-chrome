import { action, makeAutoObservable } from 'mobx';
import { AppSettings } from '@/stores/universal/settings';
import WeatherService from '@/stores/app/weather';
import BackgroundsService from '@/stores/app/backgrounds';
import { ACTIVITY } from '@/enum';

class AppStateStore {
    coreService;
    activity = ACTIVITY.DESKTOP;
    settings;
    weather;
    backgrounds;

    constructor({ coreService }) {
        makeAutoObservable(this);
        this.coreService = coreService;
        this.settings = new AppSettings();
        this.weather = new WeatherService(coreService);
        this.backgrounds = new BackgroundsService(coreService);

        this.activity = this.settings.defaultActivity || ACTIVITY.DESKTOP;
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
}

export default AppStateStore;
