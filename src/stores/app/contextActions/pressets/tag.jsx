import { ContextMenuItem } from '@/stores/app/contextMenu/entities';
import { BookmarkAddRounded as AddBookmarkIcon } from '@/icons';

const tagContextMenu = ({
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
            defaultTagsIds: [itemId],
        }, next),
    }),
];

export default tagContextMenu;
