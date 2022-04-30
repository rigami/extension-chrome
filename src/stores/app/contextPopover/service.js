import { action, makeAutoObservable, toJS } from 'mobx';

let context;

class ContextPopoverService {
    popovers = {};
    isOpen = {};
    activeStateKeys = [];
    stateKeys = [];

    constructor() {
        makeAutoObservable(this);

        context = this;
    }

    @action.bound
    close(stateKey) {
        console.log('Close stateKey:', stateKey);
        context._closeKey(stateKey);
        context.popovers[stateKey]?.onClose?.();
        context.popovers[stateKey]?.nextClose?.();
        context.isOpen[stateKey] = false;
    }

    @action.bound
    clear(stateKey) {
        console.log('Clear stateKey:', stateKey);
        context.stateKeys = context.stateKeys.filter((key) => key !== stateKey);
        delete context.popovers[stateKey];
        delete context.isOpen[stateKey];
    }

    @action.bound
    createDispatcher(fabric = () => [], options = {}, stateKey) {
        return {
            dispatchPopover: (event, overridePosition, data, next) => context.dispatchPopover(fabric, options, {
                overridePosition,
                stateKey,
                event,
                data,
                next,
            }),
            isOpen: context.activeStateKeys.indexOf(stateKey) !== -1,
            close: () => context.close(stateKey),
        };
    }

    @action.bound
    _closeKey(stateKey) {
        context.activeStateKeys = context.activeStateKeys.filter((key) => key !== stateKey);
    }

    @action.bound
    dispatchPopover(fabric = () => [], options = {}, props = {}) {
        console.log('dispatchPopover:', options, props);
        const {
            useAnchorEl,
            reactions,
            onOpen,
            onClose,
            className,
            classes = {},
            nonBlockEventsBackdrop = false,
            disableAutoFocus = false,
            disableEnforceFocus = false,
            disableRestoreFocus = false,
        } = options;
        const {
            stateKey,
            event,
            overridePosition,
            data,
            next,
        } = props;

        let positionOrAnchor = overridePosition || {
            top: event.nativeEvent.clientY,
            left: event.nativeEvent.clientX,
        };

        if (useAnchorEl) {
            const { top, left } = event.currentTarget.getBoundingClientRect();
            positionOrAnchor = {
                top,
                left,
            };
        }

        this.popovers[stateKey] = {
            stateKey,
            content: () => fabric(data, positionOrAnchor, () => this.close(stateKey)),
            nextClose: next && next(),
            position: positionOrAnchor.top ? positionOrAnchor : null,
            anchorEl: positionOrAnchor.current ? positionOrAnchor : null,
            reactions,
            onOpen,
            onClose,
            className,
            classes,
            nonBlockEventsBackdrop,
            disableAutoFocus,
            disableEnforceFocus,
            disableRestoreFocus,
        };

        console.log('this.activeStateKeys:', toJS(this.activeStateKeys));

        this.activeStateKeys.push(stateKey);
        if (this.stateKeys.indexOf(stateKey) === -1) this.stateKeys.push(stateKey);
        this.popovers[stateKey]?.onOpen?.();
        this.isOpen[stateKey] = true;
        console.log('Open stateKey:', stateKey);
    }
}

export default ContextPopoverService;
