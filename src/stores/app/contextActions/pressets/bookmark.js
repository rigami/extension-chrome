import copyToClipboard from 'copy-to-clipboard';
import { ContextMenuItem } from '@/stores/app/contextMenu/entities';
import { ContentCopyFilled as CopyToClipboardIcon } from '@/icons';
import BookmarksUniversalService from '@/stores/universal/workingSpace/bookmarks';

const bookmarkContextMenu = ({ t, itemId }) => [
    new ContextMenuItem({
        title: t('bookmark:button.copyUrl'),
        icon: CopyToClipboardIcon,
        onClick: async () => {
            const bookmark = await BookmarksUniversalService.get(itemId);
            copyToClipboard(bookmark.url);
        },
    }),
    new ContextMenuItem({
        title: t('bookmark:button.copy'),
        icon: CopyToClipboardIcon,
        onClick: async () => {
            const bookmark = await BookmarksUniversalService.get(itemId);
            if (bookmark.description) {
                copyToClipboard(`${bookmark.name}\n${bookmark.description}\n\n${bookmark.url}`);
            } else {
                copyToClipboard(`${bookmark.name}\n${bookmark.url}`);
            }
        },
    }),
];

export default bookmarkContextMenu;
