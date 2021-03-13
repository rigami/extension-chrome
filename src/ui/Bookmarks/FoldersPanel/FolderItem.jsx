import { ListItem, ListItemSecondaryAction, ListItemText } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import pin from '@/utils/contextMenu/pin';
import edit from '@/utils/contextMenu/edit';
import remove from '@/utils/contextMenu/remove';
import { useTranslation } from 'react-i18next';
import useAppService from '@/stores/app/AppStateProvider';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import useCoreService from '@/stores/app/BaseStateProvider';
import { FavoriteRounded as FavoriteIcon } from '@material-ui/icons';
import { observer } from 'mobx-react-lite';

const useStyles = makeStyles((theme) => ({
    root: {
        paddingLeft: theme.spacing(4),
        paddingRight: theme.spacing(4),
    },
    favorite: {
        color: theme.palette.error.main,
        width: 12,
        height: 12,
    },
    action: {
        display: 'flex',
        pointerEvents: 'none',
    },
}));

function FolderItem({ id, name, onClick }) {
    const classes = useStyles();
    const { t } = useTranslation();
    const appService = useAppService();
    const bookmarksService = useBookmarksService();
    const coreService = useCoreService();
    const [isPin, setIsPin] = useState(bookmarksService.findFavorite({
        itemId: id,
        itemType: 'folder',
    }));

    const contextMenu = (event) => [
        pin({
            itemId: id,
            itemType: 'folder',
            t,
            bookmarksService,
        }),
        edit({
            itemId: id,
            itemType: 'folder',
            t,
            coreService,
            anchorEl: event.currentTarget,
        }),
        remove({
            itemId: id,
            itemType: 'folder',
            t,
            coreService,
        }),
    ];

    useEffect(() => {
        setIsPin(bookmarksService.findFavorite({
            itemId: id,
            itemType: 'folder',
        }));
    }, [bookmarksService.favorites.length]);

    return (
        <ListItem
            button
            onClick={onClick}
            onContextMenu={appService.contextMenu(contextMenu)}
            className={classes.root}
        >
            <ListItemText primary={name} />
            {isPin && (
                <ListItemSecondaryAction className={classes.action}>
                    <FavoriteIcon className={classes.favorite} />
                </ListItemSecondaryAction>
            )}
        </ListItem>
    );
}

export default observer(FolderItem);
