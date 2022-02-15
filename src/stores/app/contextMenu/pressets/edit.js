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
}) => [
    edit && new ContextMenuItem({
        title: t(`common:button.${itemType === 'bookmark' ? 'edit' : 'rename'}`),
        icon: EditIcon,
        onClick: () => {
            coreService.localEventBus.call(`${itemType}/edit`, {
                id: itemId,
                position: {
                    left: event.clientX,
                    top: event.clientY,
                },
            });
        },
    }),
    move && new ContextMenuItem({
        title: t('common:button.move'),
        icon: MoveIcon,
        onClick: async () => {
            if (itemType === 'bookmark') {
                const bookmark = await BookmarksUniversalService.get(itemId);

                coreService.localEventBus.call(`${itemType}/move`, {
                    id: itemId,
                    position: {
                        left: event.clientX,
                        top: event.clientY,
                    },
                    folderId: bookmark.folderId,
                });
            }
            if (itemType === 'folder') {
                const folder = await FoldersUniversalService.get(itemId);

                coreService.localEventBus.call(`${itemType}/move`, {
                    id: itemId,
                    position: {
                        left: event.clientX,
                        top: event.clientY,
                    },
                    parentId: folder.parentId,
                });
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
