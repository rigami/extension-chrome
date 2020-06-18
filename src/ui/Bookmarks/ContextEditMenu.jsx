import React from 'react';
import {
    Menu,
    ListItem,
    ListItemIcon,
    ListItemText,
} from '@material-ui/core';
import {
    BookmarkBorderRounded as PinnedFavoriteIcon,
    BookmarkRounded as UnpinnedFavoriteIcon,
    EditRounded as EditIcon,
    DeleteRounded as RemoveIcon,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { useService as useBookmarksService } from '@/stores/bookmarks';
import { observer } from 'mobx-react-lite';

const useStyles = makeStyles(() => ({ menu: { width: 230 } }));

function ContextEditMenu({ className: externalClassName, id, type, isOpen, onClose, position, onEdit }) {
    const classes = useStyles();
    const bookmarksStore = useBookmarksService();

    const isPin = () => bookmarksStore.favorites.find((fav) => fav.type === type && fav.id === id);

    const handlePin = () => {
        if (isPin()) {
            bookmarksStore.removeFromFavorites({ type, id });
        } else {
            bookmarksStore.addToFavorites({ type, id });
        }
        onClose();
    };

    const handleEdit = () => {
        if (onEdit) {
            onEdit((data) => {
                bookmarksStore.eventBus.dispatch(`edit${type}`, { id, ...data });
            });
        } else {
            bookmarksStore.eventBus.dispatch(`edit${type}`, { id });
        }

        onClose();
    }
    const handleRemove = () => {
        bookmarksStore.eventBus.dispatch(`remove${type}`, { id });
        onClose();
    }

    return (
        <React.Fragment>
            <Menu
                open={isOpen}
                onClose={onClose}
                anchorReference="anchorPosition"
                anchorPosition={position}
                classes={{ list: classes.menu }}
            >
                <ListItem button dense onClick={handlePin}>
                    <ListItemIcon>
                        {isPin() ? (<UnpinnedFavoriteIcon />) : (<PinnedFavoriteIcon />)}
                    </ListItemIcon>
                    <ListItemText
                        primary={
                            isPin() ? 'Открепить от панели быстрого доступа' : 'Закрепить на панели быстрого доступа'
                        }
                    />
                </ListItem>
                <ListItem button dense onClick={handleEdit}>
                    <ListItemIcon>
                        <EditIcon />
                    </ListItemIcon>
                    <ListItemText primary="Изменить" />
                </ListItem>
                <ListItem button dense onClick={handleRemove}>
                    <ListItemIcon>
                        <RemoveIcon />
                    </ListItemIcon>
                    <ListItemText primary="Удалить" />
                </ListItem>
            </Menu>
        </React.Fragment>
    );
}

export default observer(ContextEditMenu);
