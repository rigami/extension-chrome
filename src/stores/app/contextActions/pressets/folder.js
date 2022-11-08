import { CreateNewFolderRounded as AddNewFolderIcon } from '@material-ui/icons';
import { ContextMenuItem } from '@/stores/app/contextMenu/entities';
import { BookmarkAddRounded as AddBookmarkIcon } from '@/icons';

const folderContextMenu = ({
    t,
    itemId,
    position = {},
    editDispatcher,
    next,
}) => [
    new ContextMenuItem({
        title: t('bookmark:button.add'),
        icon: AddBookmarkIcon,
        onClick: () => editDispatcher(null, position, {
            itemType: 'bookmark',
            defaultFolderId: itemId,
        }, next),
    }),
    new ContextMenuItem({
        title: t('folder:button.create', { context: 'sub' }),
        icon: AddNewFolderIcon,
        onClick: () => editDispatcher(null, position, {
            itemType: 'folder',
            parentId: itemId,
        }, next),
    }),
];

export default folderContextMenu;
