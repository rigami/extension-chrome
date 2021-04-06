import { ContextMenuItem } from '@/stores/app/entities/contextMenu';
import { EditRounded as EditIcon } from '@material-ui/icons';

export default ({
    itemId,
    itemType,
    coreService,
    t,
    anchorEl,
    options = {},
}) => new ContextMenuItem({
    title: t('common:button.edit'),
    icon: EditIcon,
    onClick: () => {
        coreService.localEventBus.call(`${itemType}/edit`, {
            id: itemId,
            anchorEl,
            options,
        });
    },
});
