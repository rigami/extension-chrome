import { ContextMenuItem } from '@/stores/app/contextMenu/entities';
import { BookmarkAddRounded as AddBookmarkIcon } from '@/icons';

const folderContextMenu = ({ coreService, t, itemId, position = {} }) => [
    new ContextMenuItem({
        title: t('bookmark:button.add'),
        icon: AddBookmarkIcon,
        onClick: () => {
            coreService.localEventBus.call(
                'bookmark/create',
                {
                    defaultFolderId: itemId,
                    position,
                },
            );
        },
    }),
];

export default folderContextMenu;
