import { action, makeAutoObservable } from 'mobx';
import { last } from 'lodash';
import favoriteContextMenu from '@/stores/app/contextMenu/pressets/favorite';
import folderContextMenu from './pressets/folder';
import editContextMenu from '@/stores/app/contextMenu/pressets/edit';
import { FIRST_UUID } from '@/utils/generate/uuid';
import bookmarkContextMenu from './pressets/bookmark';

let context;

class ContextMenuService {
    coreService;
    workingSpaceService;
    t;
    activeItem;

    constructor({ coreService, t, workingSpaceService }) {
        makeAutoObservable(this);
        this.coreService = coreService;
        this.workingSpaceService = workingSpaceService;
        this.t = t;

        context = this;
    }

    _baseContextMenu = ({ itemId, itemType }) => [
        favoriteContextMenu({
            workingSpaceService: this.workingSpaceService,
            t: this.t,
            itemId,
            itemType,
        }),
        itemType === 'folder' && folderContextMenu({
            coreService: this.coreService,
            t: this.t,
            itemId,
        }),
        itemType === 'bookmark' && bookmarkContextMenu({
            t: this.t,
            itemId,
        }),
        editContextMenu({
            coreService: this.coreService,
            t: this.t,
            edit: true,
            move: itemId !== FIRST_UUID,
            remove: itemId !== FIRST_UUID,
            itemId,
            itemType,
        }),
    ];

    handleOpen() {
        this.activeItem?.onOpen?.();
    }

    handleClose() {
        this.activeItem?.onClose?.();
        this.activeItem = undefined;
    }

    @action.bound
    createContextMenu(fabric = () => [], options = {}) {
        return {
            dispatchContextMenu: (event) => context.dispatchContextMenu(fabric, options, event),
            activeItem: context.activeItem,
        };
    }

    @action.bound
    dispatchContextMenu(fabric = () => [], options = {}, event) {
        const {
            useAnchorEl,
            reactions,
            onOpen,
            onClose,
            className,
        } = options;

        event.stopPropagation();
        event.preventDefault();

        this.activeItem = event;

        let position = {
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

        this.activeItem = {
            actions: () => {
                const actions = fabric(this._baseContextMenu, event);

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
            className,
        };
    }
}

export default ContextMenuService;
