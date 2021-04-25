import React, { createContext, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import useCoreService from '@/stores/app/BaseStateProvider';
import ContextMenu from '@/ui/ContextMenu';
import useAppService from '@/stores/app/AppStateProvider';
import { useTranslation } from 'react-i18next';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import { ContextMenuItem } from '@/stores/app/entities/contextMenu';
import {
    DeleteRounded as RemoveIcon,
    EditRounded as EditIcon,
    FavoriteBorderRounded as AddFavoriteIcon,
    FavoriteRounded as RemoveFavoriteIcon,
} from '@material-ui/icons';
import Favorite from '@/stores/universal/bookmarks/entities/favorite';

const context = createContext(() => ({}));

function ContextMenuProvider({ children }) {
    const appService = useAppService();
    const coreService = useCoreService();
    const bookmarksService = useBookmarksService();
    const { t } = useTranslation();
    const Context = context;

    const computeActions = ({ itemType, itemId }, event) => {
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
            new ContextMenuItem({
                title: t('common:button.edit'),
                icon: EditIcon,
                onClick: () => {
                    coreService.localEventBus.call(`${itemType}/edit`, {
                        id: itemId,
                        anchorEl: event.currentTarget,
                    });
                },
            }),
            new ContextMenuItem({
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
