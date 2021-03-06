import { ContextMenuItem } from '@/stores/app/entities/contextMenu';
import { DeleteRounded as RemoveIcon } from '@material-ui/icons';

export default ({
    itemId,
    itemType,
    coreService,
    t,
}) => new ContextMenuItem({
    title: t('remove'),
    icon: RemoveIcon,
    onClick: () => {
        coreService.localEventBus.call(`${itemType}/remove`, { id: itemId });
    },
});
