import EventBus from '@/utils/eventBus';
import { DESTINATION } from '@/enum';
import appVariables from '@/config/appVariables';

let bus = null;
const instanceId = Date.now();

class BusApp {
    _eventBus = new EventBus();
    _destination;

    constructor(destination) {
        this._destination = destination;

        if (!chrome?.runtime?.onMessage) {
            console.error('Not find runtime onMessage module');
            return;
        }

        chrome.runtime.onMessage.addListener((props, info, callback) => {
            const { event, destination: eventDestination, data, initiatorId } = props;
            console.log('event from', eventDestination, props, info);
            if (eventDestination !== this._destination || instanceId === initiatorId) return true;
            this._eventBus.call(event, data, props, callback);

            return true;
        });
    }

    call(event, destination, data, callback) {
        if (this._destination !== DESTINATION.BACKGROUND) {
            this._eventBus.call(event, data, {
                event,
                destination,
                data,
                initiatorId: instanceId,
            }, callback);
        }

        chrome.runtime.sendMessage(
            appVariables.extensionId,
            {
                destination,
                event,
                data,
                initiatorId: instanceId,
            },
            {},
            callback,
        );
    }

    on(event, callback) {
        return this._eventBus.on(event, callback);
    }

    removeListener(listenId) {
        return this._eventBus.removeListener(listenId);
    }
}

function initBus(destination) {
    bus = new BusApp(destination);

    return bus;
}

function eventToApp(event, data, callback) {
    console.log('eventToApp', event, data);
    bus.call(event, DESTINATION.APP, data, callback);
}

function eventToBackground(event, data, callback) {
    console.log('eventToBackground', event, data);
    bus.call(event, DESTINATION.BACKGROUND, data, callback);
}

function eventToRequestPermissions(event, data, callback) {
    console.log('eventToRequestPermissions', event, data);
    bus.call(event, DESTINATION.REQUEST_PERMISSIONS, data, callback);
}

function eventToPopup(event, data, callback) {
    console.log('eventToPopup', event, data);
    bus.call(event, DESTINATION.POPUP, data, callback);
}

export default () => bus;
export {
    initBus,
    eventToApp,
    eventToBackground,
    eventToRequestPermissions,
    eventToPopup,
    instanceId,
};
