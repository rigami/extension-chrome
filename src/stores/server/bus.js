import EventBus from '@/utils/eventBus';
import { DESTINATION } from '@/enum';
import appVariables from '@/config/appVariables';

let bus = null;
const instanceId = Date.now();

class BusApp {
    _eventBus = new EventBus();
    _destination;
    _awaitCallbacks = {};

    constructor(destination) {
        this._destination = destination;
        this._channel = new BroadcastChannel(`rigami-${appVariables.extensionId}`);

        this._channel.onmessage = ({ data: props }) => {
            console.log('[BUS] on message:', props);

            const { event, destination: eventDestination, initiatorId, callbackId } = props;
            console.log('event from', eventDestination, event);
            if (event === 'callback' && callbackId in this._awaitCallbacks) {
                this._awaitCallbacks[callbackId](props.data);
                delete this._awaitCallbacks[callbackId];

                return;
            }

            if (eventDestination !== this._destination || instanceId === initiatorId) return true;

            let callProps = {
                event,
                data: props.data,
                initiatorId,
            };

            if (callbackId) {
                callProps = {
                    ...callProps,
                    callbackId,
                    callback: (callbackData) => {
                        console.log('callback', callbackData);
                        this.call('callback', eventDestination, callbackData, callbackId);
                    },
                };
            }

            this._eventBus.call(event, callProps);
        };
    }

    call(event, destination, data, callback) {
        let callbackId = null;
        if (typeof callback === 'function') {
            callbackId = `${event}#${Math.random().toString().slice(2)}`;
            this._awaitCallbacks[callbackId] = callback;
        }
        if (typeof callback === 'string') {
            callbackId = callback;
        }

        if (this._destination !== DESTINATION.BACKGROUND) {
            this._eventBus.call(event, {
                event,
                destination,
                data,
                callbackId,
                initiatorId: instanceId,
            });
        }

        console.log('[BUS] post message:', JSON.parse(JSON.stringify({
            destination,
            event,
            data,
            initiatorId: instanceId,
        })));
        this._channel.postMessage(JSON.parse(JSON.stringify({
            destination,
            event,
            data,
            callbackId,
            initiatorId: instanceId,
        })));
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
