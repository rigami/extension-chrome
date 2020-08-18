import EventBus from "@/utils/eventBus";
import { observable } from 'mobx';
import {DESTINATION} from "@/enum";

let bus = null;

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

function initBus(destination) {
    bus = new BusApp(destination);
}

function eventToApp(event, data) {
    bus.call(event, DESTINATION.APP, data);
}

function eventToBackground(event, data) {
    bus.call(event, DESTINATION.BACKGROUND, data);
}

function eventToPopup(event, data) {
    bus.call(event, DESTINATION.POPUP, data);
}

export default () => bus;
export { initBus, eventToApp, eventToBackground, eventToPopup };
