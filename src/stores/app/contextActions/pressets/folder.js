import { ContextMenuItem } from '@/stores/app/contextMenu/entities';
import { BookmarkAddRounded as AddBookmarkIcon } from '@/icons';

const folderContextMenu = ({
    coreService,
    t,
    itemId,
    position = {},
    editDispatcher,
    next,
}) => [
    new ContextMenuItem({
        title: t('bookmark:button.add'),
        icon: AddBookmarkIcon,
        onClick: () => editDispatcher(null, position, { itemType: 'bookmark' }, next),
    }),
];

export default folderContextMenu;
