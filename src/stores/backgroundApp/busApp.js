import EventBus from "@/utils/eventBus";
import { observable } from 'mobx';

class BusApp {
    _eventBus = new EventBus();
    @observable _destination;

    constructor(destination) {
        this._destination = destination;

        if (!chrome?.runtime?.onMessage) {
            console.error("Not find runtime onMessage module");
            return;
        }

        chrome.runtime.onMessage.addListener(({ event, destination, data }) => {
            if (destination !== this._destination) return;

            this._eventBus.dispatch(event, data)
        });
    }

    call(event, destination, data) {
        chrome.runtime.sendMessage(
            null,
            { destination, event, data },
        );
    }

    on(event, callback) {
        return this._eventBus.on(event, callback);
    }
}

export default BusApp;
