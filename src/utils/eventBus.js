class EventBus {
    listeners = {};
    byEvents = {};
    nextListenerId = 0;

    dispatch(event, props) {
        this.byEvents[event].forEach((listenerId) => {
            this.listeners[listenerId].callback(props);
        })
    }

    on(event, callback) {
        if (!event) throw new Error("event should be indicated");
        if (typeof callback !== 'function') throw new Error("callback should be indicated and must be a function");

        const currentListenerId = `$-${event}-${this.nextListenerId}`;
        this.nextListenerId++;

        this.listeners[currentListenerId] = { event, callback };

        if (event in this.byEvents) {
            this.byEvents[event].push(currentListenerId);
        } else {
            this.byEvents[event] = [currentListenerId];
        }

        return currentListenerId;
    }

    removeListener(removeListenerId) {
        const event = this.listeners[removeListenerId]?.event;

        if (!event) return;

        this.byEvents[event].filter((listenerId) => listenerId !== removeListenerId)
        delete this.listeners[removeListenerId];
    }
}
