import favoriteContextMenu from '@/stores/app/contextActions/pressets/favorite';
import bookmarkContextMenu from '@/stores/app/contextActions/pressets/bookmark';
import folderContextMenu from '@/stores/app/contextActions/pressets/folder';
import editContextMenu from '@/stores/app/contextActions/pressets/edit';
import { FIRST_UUID } from '@/utils/generate/uuid';

const baseContextMenu = ({
    workingSpaceService,
    t,
    coreService,
    contextEdit,
    contextMove,
}) => (event, position, { itemId, itemType }, next) => [
    favoriteContextMenu({
        workingSpaceService,
        t,
        itemId,
        itemType,
    }),
    itemType === 'folder' && folderContextMenu({
        coreService,
        t,
        itemId,
        position,
        editDispatcher: contextEdit.dispatchPopover,
        next,
    }),
    itemType === 'bookmark' && bookmarkContextMenu({
        t,
        itemId,
    }),
    editContextMenu({
        coreService,
        t,
        edit: true,
        move: itemId !== FIRST_UUID,
        remove: itemId !== FIRST_UUID,
        itemId,
        itemType,
        position,
        editDispatcher: contextEdit.dispatchPopover,
        moveDispatcher: contextMove.dispatchPopover,
        next,
    }),
];

export default baseContextMenu;
