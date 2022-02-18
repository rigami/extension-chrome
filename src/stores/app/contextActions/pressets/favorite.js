import { StarBorderRounded as AddFavoriteIcon, StarRounded as RemoveFavoriteIcon } from '@material-ui/icons';
import { ContextMenuItem } from '@/stores/app/contextMenu/entities';
import Favorite from '@/stores/universal/bookmarks/entities/favorite';

const favoriteContextMenu = ({ workingSpaceService, t, itemType, itemId }) => {
    const isFavorite = workingSpaceService.findFavorite({
        itemId,
        itemType,
    });

    return [
        new ContextMenuItem({
            title: isFavorite ? t('common:button.favorite.remove') : t('common:button.favorite.add'),
            icon: isFavorite ? RemoveFavoriteIcon : AddFavoriteIcon,
            onClick: () => {
                if (isFavorite) {
                    workingSpaceService.removeFromFavorites(workingSpaceService.findFavorite({
                        itemType,
                        itemId,
                    })?.id);
                } else {
                    workingSpaceService.addToFavorites(new Favorite({
                        itemType,
                        itemId,
                    }));
                }
            },
        }),
    ];
};

export default favoriteContextMenu;
