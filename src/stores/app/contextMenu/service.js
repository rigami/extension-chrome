import { action, makeAutoObservable } from 'mobx';
import { last } from 'lodash';

let context;

class ContextMenuService {
    menu;
    isOpen = false;
    activeStateKeys = [];

    constructor() {
        makeAutoObservable(this);

        context = this;
    }

    @action.bound
    close() {
        console.log('Close stateKey:', context.menu.stateKey);
        context._closeKey(context.menu.stateKey);
        context.menu?.onClose?.();
        context.isOpen = false;
    }

    @action.bound
    createDispatcher(fabric = () => [], options = {}, stateKey) {
        return {
            dispatchContextMenu: (event, overridePosition, data) => context.dispatchContextMenu(fabric, options, {
                overridePosition,
                stateKey,
                event,
                data,
            }),
            isOpen: context.activeStateKeys.indexOf(stateKey) !== -1,
        };
    }

    @action.bound
    _closeKey(stateKey) {
        let isFound = false;

        context.activeStateKeys = context.activeStateKeys.filter((key) => {
            if (!isFound && key === stateKey) {
                isFound = true;

                return false;
            }

            return true;
        });
    }

    @action.bound
    _nextBind(stateKey) {
        return () => {
            console.log('Next open stateKey:', stateKey);
            context.activeStateKeys.push(stateKey);

            return () => {
                console.log('Next close stateKey:', stateKey);
                context._closeKey(stateKey);
            };
        };
    }

    @action.bound
    dispatchContextMenu(fabric = () => [], options = {}, props = {}) {
        const {
            useAnchorEl,
            reactions,
            onOpen,
            onClose,
            classes,
        } = options;
        const {
            overridePosition,
            stateKey,
            event,
        } = props;

        event.stopPropagation();
        event.preventDefault();

        let position = overridePosition || {
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

        this.menu = {
            actions: () => {
                const actions = fabric(event, position, this._nextBind(stateKey));

                const calcActions = [];
                let lastIsArray = true;

                actions.forEach((item) => {
                    if (Array.isArray(item)) {
                        calcActions.push(item);
                        lastIsArray = true;
                    } else {
                        if (lastIsArray) {
                            calcActions.push([]);
                            lastIsArray = false;
                        }

                        if (item) last(calcActions).push(item);
                    }
                });

                return calcActions.filter((group) => group.length);
            },
            position,
            reactions,
            onOpen,
            onClose,
            classes,
            stateKey,
        };
        this.activeStateKeys.push(stateKey);
        this.menu?.onOpen?.();
        this.isOpen = true;
        console.log('Open stateKey:', stateKey);
    }
}

export default ContextMenuService;
