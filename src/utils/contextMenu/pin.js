import { ContextMenuItem } from '@/stores/app/entities/contextMenu';
import {
    FavoriteBorderRounded as AddFavoriteIcon,
    FavoriteRounded as RemoveFavoriteIcon,
} from '@material-ui/icons';
import Favorite from '@/stores/universal/bookmarks/entities/favorite';

export default ({ itemId, itemType, bookmarksService, t }) => {
    const isPin = () => bookmarksService.findFavorite({
        itemType,
        itemId,
    });

    return new ContextMenuItem({
        title: isPin() ? t('fap.unpin') : t('fap.pin'),
        icon: isPin() ? RemoveFavoriteIcon : AddFavoriteIcon,
        onClick: () => {
            if (isPin()) {
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
    });
};
