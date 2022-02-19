import favoriteContextMenu from '@/stores/app/contextActions/pressets/favorite';
import bookmarkContextMenu from '@/stores/app/contextActions/pressets/bookmark';
import folderContextMenu from '@/stores/app/contextActions/pressets/folder';
import editContextMenu from '@/stores/app/contextActions/pressets/edit';
import { FIRST_UUID } from '@/utils/generate/uuid';
import tagContextMenu from '@/stores/app/contextActions/pressets/tag';

const baseContextMenu = ({
    workingSpaceService,
    t,
    contextEdit,
    contextMove,
    contextDelete,
}) => (event, position, { itemId, itemType }, next) => [
    favoriteContextMenu({
        workingSpaceService,
        t,
        itemId,
        itemType,
    }),
    itemType === 'folder' && folderContextMenu({
        t,
        itemId,
        position,
        editDispatcher: contextEdit.dispatchPopover,
        next,
    }),
    itemType === 'tag' && tagContextMenu({
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
        t,
        edit: true,
        move: itemId !== FIRST_UUID && itemType !== 'tag',
        remove: itemId !== FIRST_UUID,
        itemId,
        itemType,
        position,
        editDispatcher: contextEdit.dispatchPopover,
        moveDispatcher: contextMove.dispatchPopover,
        deleteDispatcher: contextDelete.dispatchPopover,
        next,
    }),
];

export default baseContextMenu;
