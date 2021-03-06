import { ContextMenuItem } from '@/stores/app/entities/contextMenu';
import { EditRounded as EditIcon } from '@material-ui/icons';

export default ({
    itemId,
    itemType,
    coreService,
    t,
    anchorEl,
}) => new ContextMenuItem({
    title: t('edit'),
    icon: EditIcon,
    onClick: () => {
        coreService.localEventBus.call(`${itemType}/edit`, {
            id: itemId,
            anchorEl,
        });
    },
});
