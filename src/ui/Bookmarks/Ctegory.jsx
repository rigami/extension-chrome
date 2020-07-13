import React, { useRef } from 'react';
import {
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemSecondaryAction,
    IconButton,
    Tooltip,
    Box,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
    LabelRounded as LabelIcon,
    BookmarkBorderRounded as PinnedFavoriteIcon,
    BookmarkRounded as UnpinnedFavoriteIcon,
    EditRounded as EditIcon,
    DeleteRounded as RemoveIcon,
} from '@material-ui/icons';
import { useService as useBookmarksService } from '@/stores/bookmarks';
import { observer } from 'mobx-react-lite';

const useStyles = makeStyles((theme) => ({
    root: {
        '&:hover $actions': {
            opacity: 1,
            pointerEvents: 'auto',
        },
    },
    container: {
        marginTop: theme.spacing(3),
        listStyle: 'none',
    },
    text: { maxWidth: 700 },
    title: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    description: {
        display: '-webkit-box',
        overflow: 'hidden',
        '-webkit-box-orient': 'vertical',
        '-webkit-line-clamp': 3,
    },
    actions: {
        opacity: 0,
        pointerEvents: 'none',
    },
    bookmarksWrapper: {
        display: 'flex',
        flexWrap: 'wrap',
    },
}));


function CategoryHeader({ id, color, name, children }) {
    const classes = useStyles();
    const bookmarksStore = useBookmarksService();
    const anchorEl = useRef(null);

    const isPin = () => bookmarksStore.favorites.find((fav) => fav.type === 'category' && fav.id === id);

    const handlePin = () => {
        if (isPin()) {
            bookmarksStore.removeFromFavorites({
                type: 'category',
                id,
            });
        } else {
            bookmarksStore.addToFavorites({
                type: 'category',
                id,
            });
        }
    };

    return (
        <Box className={classes.root}>
            {id !== 'all' && (
                <ListItem
                    disableGutters
                    component="div"
                    classes={{
                        root: classes.root,
                        container: classes.container,
                    }}
                >
                    {id !== 'best' && (
                        <ListItemIcon style={{ minWidth: 36 }}>
                            <LabelIcon style={{ color }} />
                        </ListItemIcon>
                    )}
                    <ListItemText
                        classes={{
                            root: classes.text,
                            primary: classes.title,
                            secondary: classes.description,
                        }}
                        primary={name || 'Неизвестная категория'}
                    />
                    {id !== 'best' && (
                        <ListItemSecondaryAction className={classes.actions}>
                            <Tooltip
                                title={
                                    isPin()
                                        ? 'Открепить от панели быстрого доступа'
                                        : 'Закрепить на панели быстрого доступа'
                                }
                            >
                                <IconButton onClick={handlePin}>
                                    {isPin() ? (<UnpinnedFavoriteIcon />) : (<PinnedFavoriteIcon />)}
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Изменить">
                                <IconButton
                                    buttonRef={anchorEl}
                                    onClick={() => bookmarksStore.eventBus.dispatch(
                                        `editcategory`,
                                        { id, anchorEl: anchorEl.current },
                                    )}
                                >
                                    <EditIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Удалить">
                                <IconButton
                                    onClick={() => bookmarksStore.eventBus.dispatch(
                                        `removecategory`,
                                        { id },
                                        )}
                                >
                                    <RemoveIcon />
                                </IconButton>
                            </Tooltip>
                        </ListItemSecondaryAction>
                    )}
                </ListItem>
            )}
            <Box className={classes.bookmarksWrapper}>
                {children}
            </Box>
        </Box>
    );
}

export default observer(CategoryHeader);
