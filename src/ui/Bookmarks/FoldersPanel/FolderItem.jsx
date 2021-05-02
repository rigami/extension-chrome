import { ListItem, ListItemSecondaryAction, ListItemText } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import { StarRounded as FavoriteIcon } from '@material-ui/icons';
import { observer } from 'mobx-react-lite';
import useContextMenu from '@/stores/app/ContextMenuProvider';

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
    const bookmarksService = useBookmarksService();
    const contextMenu = useContextMenu({
        itemId: id,
        itemType: 'folder',
    });
    const [isPin, setIsPin] = useState(bookmarksService.findFavorite({
        itemId: id,
        itemType: 'folder',
    }));

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
            onContextMenu={contextMenu}
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
