import EventBus from '@/utils/eventBus';
import { observable } from 'mobx';
import { DESTINATION } from '@/enum';
import appVariables from '@/config/appVariables';

let bus = null;
const instanceId = Date.now();

class BusApp {
    _eventBus = new EventBus();
    @observable _destination;

    constructor(destination) {
        this._destination = destination;

        if (!chrome?.runtime?.onMessage) {
            console.error('Not find runtime onMessage module');
            return;
        }

        chrome.runtime.onMessage.addListener((props, info, callback) => {
            const { event, destination: eventDestination, data, initiatorId } = props;
            if (eventDestination !== this._destination || instanceId === initiatorId) return;

            this._eventBus.call(event, data, props, callback);
        });
    }

    call(event, destination, data, callback) {
        console.log('Call', event, destination, data, callback);

        this._eventBus.call(event, data, {
            event,
            destination,
            data,
            initiatorId: instanceId,
        }, callback);

        chrome.runtime.sendMessage(
            appVariables.extensionId,
            {
                destination,
                event,
                data,
                initiatorId: instanceId,
            },
            callback,
        );
    }

    on(event, callback) {
        return this._eventBus.on(event, callback);
    }
}

function initBus(destination) {
    bus = new BusApp(destination);

    return bus;
}

function eventToApp(event, data, callback) {
    bus.call(event, DESTINATION.APP, data, callback);
}

function eventToBackground(event, data, callback) {
    bus.call(event, DESTINATION.BACKGROUND, data, callback);
}

function eventToPopup(event, data, callback) {
    bus.call(event, DESTINATION.POPUP, data, callback);
}

export default () => bus;
export {
    initBus,
    eventToApp,
    eventToBackground,
    eventToPopup,
    instanceId,
};
