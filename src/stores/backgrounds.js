import { observable, action } from 'mobx';
import default_settings from "config/settings";

class BackgroundsStore {
    @observable change_interval;
    @observable selection_method;
    @observable bg_type;

    constructor() {
        this.change_interval = default_settings.backgrounds.change_interval;
        this.selection_method = default_settings.backgrounds.selection_method;
        this.bg_type = default_settings.backgrounds.bg_type;
    }

    @action('set selection method')
    setSelectionMethod(selection_method) {
        this.selection_method = selection_method;
    }

    @action('set change interval')
    setChangeInterval(change_interval) {
        this.change_interval = change_interval;
    }

    @action('set bg types')
    setBgType(bg_types) {
        this.bg_type = [...bg_types];
    }

    @action('toggle bg type')
    toggleBgType(bg_type) {
        if (this.bg_type.find(type => type === bg_type)) {
            this.bg_type.filter(type => type !== bg_type)
        } else {
            this.bg_type.push(bg_type);
        }
    }
}

export default new BackgroundsStore();