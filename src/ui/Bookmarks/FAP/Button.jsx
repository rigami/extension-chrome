import React from 'react';
import {
    Tooltip,
    Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import {
    BookmarkBorderRounded as PinnedFavoriteIcon,
    BookmarkRounded as UnpinnedFavoriteIcon,
    EditRounded as EditIcon,
    DeleteRounded as RemoveIcon,
} from '@material-ui/icons';
import { observer } from 'mobx-react-lite';
import useCoreService from '@/stores/BaseStateProvider';
import useBookmarksService from '@/stores/BookmarksProvider';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
    root: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        padding: 0,
        borderRadius: theme.shape.borderRadiusBold
    },
    rootBlur: { backdropFilter: 'blur(10px) brightness(130%)' },
}));

function FAPButton(props) {
    const {
        id,
        tooltip,
        isBlurBackdrop,
        type = 'bookmark',
        children,
        ...other
    } = props;
    const classes = useStyles();
    const coreService = useCoreService();
    const bookmarksService = useBookmarksService();
    const { t } = useTranslation();

    const isPin = () => bookmarksService.favorites.find((fav) => fav.type === type && fav.id === id);

    const handlerContextMenu = (event) => {
        event.preventDefault();
        coreService.localEventBus.call('system/contextMenu', {
            actions: [
                {
                    type: 'button',
                    title: isPin() ? t('fap.unpin') : t('fap.pin'),
                    icon: isPin() ? UnpinnedFavoriteIcon : PinnedFavoriteIcon,
                    onClick: () => {
                        if (isPin()) {
                            bookmarksService.removeFromFavorites({
                                type,
                                id,
                            });
                        } else {
                            bookmarksService.addToFavorites({
                                type,
                                id,
                            });
                        }
                    },
                },
                {
                    type: 'button',
                    title: t('edit'),
                    icon: EditIcon,
                    onClick: () => {
                        coreService.localEventBus.call(`${type}/edit`, {
                            id,
                            anchorEl: type !== 'bookmark' &&  event.currentTarget,
                        });
                    },
                },
                {
                    type: 'button',
                    title: t('remove'),
                    icon: RemoveIcon,
                    onClick: () => {
                        coreService.localEventBus.call(`${type}/remove`, {
                            id,
                            anchorEl: type !== 'bookmark' &&  event.currentTarget,
                        });
                    },
                },
            ],
            position: {
                top: event.nativeEvent.clientY,
                left: event.nativeEvent.clientX,
            },
        });
    };

    return (
        <Tooltip
            title={tooltip}
            enterDelay={400}
            enterNextDelay={400}
        >
            {React.isValidElement(children) ? React.cloneElement(children, {
                ...other,
                className: clsx(
                    classes.root,
                    isBlurBackdrop && classes.rootBlur,
                    children.props.className,
                ),
                onContextMenu: handlerContextMenu,
            }) : children}
        </Tooltip>
    );
}

export default observer(FAPButton);
