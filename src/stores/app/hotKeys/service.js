import {
    action, makeAutoObservable, reaction, toJS,
} from 'mobx';
import EventBus from '@/utils/eventBus';

let context;

class HotKeysService {
    bus;
    combination = [];

    constructor() {
        makeAutoObservable(this);

        this.bus = new EventBus();

        context = this;

        reaction(
            () => this.combination.toString(),
            () => {
                this.bus.call(this.combination.sort().join(','));
                this.bus.call('*');
            },
        );
    }

    @action.bound
    _keyDown(event) {
        if (!this.combination.includes(event.code)) this.combination.push(event.code);
    }

    @action.bound
    _keyUp(event) {
        this.combination = this.combination.filter((key) => key !== event.code);
    }

    @action.bound
    _resetAllKeys() {
        this.combination = [];
    }

    @action.bound
    on(keys, callback) {
        return this.bus.on(keys.sort().join(','), () => callback(this.combination));
    }

    @action.bound
    removeListener(listener) {
        return this.bus.removeListener(listener);
    }
}

export default HotKeysService;
