import { DeleteRounded as RemoveIcon, EditRounded as EditIcon } from '@material-ui/icons';
import { ContextMenuItem } from '@/stores/app/contextMenu/entities';
import { DriveFileMoveFilled as MoveIcon } from '@/icons';
import BookmarksUniversalService from '@/stores/universal/bookmarks/bookmarks';
import FoldersUniversalService from '@/stores/universal/bookmarks/folders';

const editContextMenu = ({
    coreService,
    t,
    edit = true,
    move = true,
    remove = true,
    itemType,
    itemId,
    position = {},
    editDispatcher,
    moveDispatcher,
    next,
}) => [
    edit && new ContextMenuItem({
        title: t(`common:button.${itemType === 'bookmark' ? 'edit' : 'rename'}`),
        icon: EditIcon,
        onClick: () => editDispatcher(null, position, {
            itemType,
            itemId,
        }, next),
    }),
    move && new ContextMenuItem({
        title: t('common:button.move'),
        icon: MoveIcon,
        onClick: async () => {
            if (itemType === 'bookmark') {
                const bookmark = await BookmarksUniversalService.get(itemId);

                moveDispatcher(null, position, {
                    itemType,
                    itemId,
                    moveId: bookmark.folderId,
                }, next);
            }
            if (itemType === 'folder') {
                const folder = await FoldersUniversalService.get(itemId);

                moveDispatcher(null, position, {
                    itemType,
                    itemId,
                    parentId: folder.parentId,
                }, next);
            }
        },
    }),
    remove && new ContextMenuItem({
        title: t('common:button.remove'),
        icon: RemoveIcon,
        onClick: () => {
            coreService.localEventBus.call(`${itemType}/remove`, { id: itemId });
        },
    }),
].filter(Boolean);

export default editContextMenu;
