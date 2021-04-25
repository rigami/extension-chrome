import React, { createContext, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import useCoreService from '@/stores/app/BaseStateProvider';
import ContextMenu from '@/ui/ContextMenu';
import { useTranslation } from 'react-i18next';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import { ContextMenuDivider, ContextMenuItem } from '@/stores/app/entities/contextMenu';
import {
    DeleteRounded as RemoveIcon,
    EditRounded as EditIcon,
    FavoriteBorderRounded as AddFavoriteIcon,
    FavoriteRounded as RemoveFavoriteIcon,
} from '@material-ui/icons';
import {
    ContentCopyFilled as CopyToClipboardIcon,
    DriveFileMoveFilled as MoveIcon,
} from '@/icons';
import Favorite from '@/stores/universal/bookmarks/entities/favorite';
import copyToClipboard from 'copy-to-clipboard';
import BookmarksUniversalService from '@/stores/universal/bookmarks/bookmarks';
import FoldersUniversalService from '@/stores/universal/bookmarks/folders';

const context = createContext(() => ({}));

function ContextMenuProvider({ children }) {
    const coreService = useCoreService();
    const bookmarksService = useBookmarksService();
    const { t } = useTranslation(['bookmark']);
    const Context = context;

    const computeActions = (props, event) => {
        const {
            itemType,
            itemId,
            disableEdit = false,
            disableRemove = false,
            disableMove = false,
        } = props;
        const isFavorite = bookmarksService.findFavorite({
            itemId,
            itemType,
        });

        return [
            new ContextMenuItem({
                title: isFavorite ? t('common:button.favorite.remove') : t('common:button.favorite.add'),
                icon: isFavorite ? RemoveFavoriteIcon : AddFavoriteIcon,
                onClick: () => {
                    if (isFavorite) {
                        bookmarksService.removeFromFavorites(bookmarksService.findFavorite({
                            itemType,
                            itemId,
                        })?.id);
                    } else {
                        bookmarksService.addToFavorites(new Favorite({
                            itemType,
                            itemId,
                        }));
                    }
                },
            }),
            ...(itemType === 'bookmark' ? [
                new ContextMenuDivider(),
                new ContextMenuItem({
                    title: t('button.copyUrl'),
                    icon: CopyToClipboardIcon,
                    onClick: async () => {
                        const bookmark = await BookmarksUniversalService.get(itemId);
                        copyToClipboard(bookmark.url);
                    },
                }),
                new ContextMenuItem({
                    title: t('button.copy'),
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
            ] : []),
            new ContextMenuDivider(),
            !disableEdit && new ContextMenuItem({
                title: t('common:button.edit'),
                icon: EditIcon,
                onClick: () => {
                    coreService.localEventBus.call(`${itemType}/edit`, {
                        id: itemId,
                        anchorEl: event.currentTarget,
                    });
                },
            }),
            !disableMove && new ContextMenuItem({
                title: t('common:button.move'),
                icon: MoveIcon,
                onClick: async () => {
                    if (itemType === 'bookmark') {
                        const bookmark = await BookmarksUniversalService.get(itemId);

                        coreService.localEventBus.call(`${itemType}/move`, {
                            id: itemId,
                            anchorEl: event.currentTarget,
                            folderId: bookmark.folderId,
                        });
                    }
                    if (itemType === 'folder') {
                        const folder = await FoldersUniversalService.get(itemId);

                        coreService.localEventBus.call(`${itemType}/move`, {
                            id: itemId,
                            anchorEl: event.currentTarget,
                            parentId: folder.parentId,
                        });
                    }
                },
            }),
            !disableRemove && new ContextMenuItem({
                title: t('common:button.remove'),
                icon: RemoveIcon,
                onClick: () => {
                    coreService.localEventBus.call(`${itemType}/remove`, { id: itemId });
                },
            }),
        ];
    };

    const handleContextMenu = (itemOrCreator, { useAnchorEl = false, reactions } = {}) => (event) => {
        event.stopPropagation();
        event.preventDefault();

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

        coreService.localEventBus.call('system/contextMenu', {
            actions: () => (
                typeof itemOrCreator === 'function'
                    ? itemOrCreator(event)
                    : computeActions(itemOrCreator, event)
            ).filter((isExist) => isExist),
            position,
            reactions,
        });
    };

    return (
        <Context.Provider value={handleContextMenu}>
            {children}
            <ContextMenu />
        </Context.Provider>
    );
}

const observerProvider = observer(ContextMenuProvider);
const useContextMenu = (...props) => useContext(context)(...props);

export default useContextMenu;
export { observerProvider as Provider };
