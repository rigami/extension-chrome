import React from 'react';
import { Card, CardActionArea, CardHeader } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
    BookmarkBorderRounded as PinnedFavoriteIcon,
    BookmarkRounded as UnpinnedFavoriteIcon,
    DeleteRounded as RemoveIcon,
    EditRounded as EditIcon,
    FolderRounded as FolderIcon
} from '@material-ui/icons';
import clsx from 'clsx';
import useBookmarksService from '@/stores/BookmarksProvider';
import useCoreService from '@/stores/BaseStateProvider';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
    root: {
        width: 180,
    },
    header: {
        padding: theme.spacing(1, 2),
    },
    headerContent: {
        overflow: 'hidden',
    },
    title: {
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },
}));

function FolderCard({ id, name, className: externalClassName, ...other }) {
    const { t } = useTranslation();
    const classes = useStyles();
    const coreService = useCoreService();
    const bookmarksService = useBookmarksService();

    const isPin = () => bookmarksService.favorites.find((fav) => fav.type === 'folder' && fav.id === id);

    const handlerContextMenu = (event, anchorEl) => {
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
                                type: 'folder',
                                id,
                            });
                        } else {
                            bookmarksService.addToFavorites({
                                type: 'folder',
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
                        coreService.localEventBus.call('folder/edit', {
                            id,
                            anchorEl,
                        });
                    },
                },
                {
                    type: 'button',
                    title: t('remove'),
                    icon: RemoveIcon,
                    onClick: () => {
                        coreService.localEventBus.call('folder/remove', { id });
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
        <Card variant="outlined" className={clsx(classes.root, externalClassName)} {...other}>
            <CardActionArea
                onContextMenu={(event) => handlerContextMenu(event, event.currentTarget)}
            >
                <CardHeader
                    avatar={<FolderIcon />}
                    title={name}
                    classes={{
                        root: classes.header,
                        content: classes.headerContent,
                        title: classes.title,
                    }}
                />
            </CardActionArea>
        </Card>
    );
}

export default FolderCard;
