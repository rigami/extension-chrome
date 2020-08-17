import React, { useState, useEffect, useRef } from 'react';
import {
    Card,
    CardHeader,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    CircularProgress,
    IconButton,
    Tooltip,
    Typography,
} from '@material-ui/core';
import {
    LabelRounded as LabelIcon,
    BookmarkBorderRounded as PinnedFavoriteIcon,
    BookmarkRounded as UnpinnedFavoriteIcon,
    EditRounded as EditIcon,
    DeleteRounded as RemoveIcon,
    MoreVertRounded as MoreIcon,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { useService as useBookmarksService } from '@/stores/bookmarks';
import Scrollbar from '@/ui-components/CustomScroll';
import FullScreenStub from '@/ui-components/FullscreenStub';
import Image from "@/ui-components/Image";
import { useTranslation } from 'react-i18next';
import {useService as useAppService} from "@/stores/app";

const useStyles = makeStyles((theme) => ({
    root: {
        width: 310,
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
        backdropFilter: 'blur(15px) brightness(130%)',
        backgroundColor: fade(theme.palette.background.default, 0.70),
    },
    avatar: { display: 'flex' },
    list: {
        height: 300,
        overflow: 'auto',
    },
    primaryText: {
        display: '-webkit-box',
        '-webkit-box-orient': 'vertical',
        '-webkit-line-clamp': 2,
        overflow: 'hidden',
        wordBreak: 'break-word',
    },
    secondaryText: {
        display: '-webkit-box',
        '-webkit-box-orient': 'vertical',
        '-webkit-line-clamp': 2,
        overflow: 'hidden',
        wordBreak: 'break-word',
    },
}));

function Link({ name, url, imageUrl, id, description, icoVariant }) {
    const classes = useStyles();
    const appStore = useAppService();
    const bookmarksStore = useBookmarksService();
    const { t } = useTranslation();

    const isPin = () => bookmarksStore.favorites.find((fav) => fav.type === 'bookmark' && fav.id === id);

    const handlerContextMenu = (event) => {
        event.preventDefault();
        openMenu({
            top: event.nativeEvent.clientY,
            left: event.nativeEvent.clientX,
        });
    };

    const openMenu = (position) => {
        appStore.eventBus.dispatch('contextMenu', {
            actions: [
                {
                    type: 'button',
                    title: isPin() ? t("fap.unpin") : t("fap.pin"),
                    icon: isPin() ? UnpinnedFavoriteIcon : PinnedFavoriteIcon,
                    onClick: () => {
                        if (isPin()) {
                            bookmarksStore.removeFromFavorites({ type: 'bookmark', id });
                        } else {
                            bookmarksStore.addToFavorites({ type: 'bookmark', id });
                        }
                    }
                },
                {
                    type: 'button',
                    title: t("edit"),
                    icon: EditIcon,
                    onClick: () => {
                        bookmarksStore.eventBus.dispatch(`editbookmark`, { id });
                    }
                },
                {
                    type: 'button',
                    title: t("remove"),
                    icon: RemoveIcon,
                    onClick: () => {
                        bookmarksStore.eventBus.dispatch(`removebookmark`, { id });
                    }
                }
            ],
            position,
        });
    };

    const handleClick = (event) => {
        if (event.button === 1) {
            window.open(url);
        } else if (event.button === 0) {
            window.open(url, "_self");
        }
    };

    return (
        <Tooltip
            title={(
                <React.Fragment>
                    {name}
                    <br />
                    <Typography variant="caption">{url}</Typography>
                </React.Fragment>
            )}
            enterDelay={400}
            enterNextDelay={400}
        >
            <ListItem
                button
                key={id}
                onMouseUp={handleClick}
                onContextMenu={handlerContextMenu}
            >
                <ListItemAvatar>
                    <Image variant={icoVariant === 'poster' ? 'small' : icoVariant} src={imageUrl} />
                </ListItemAvatar>
                <ListItemText
                    primary={name}
                    secondary={description}
                    classes={{
                        primary: classes.primaryText,
                        secondary: classes.secondaryText,
                    }}
                />
            </ListItem>
        </Tooltip>
    );
}

function Folder({ id }) {
    const classes = useStyles();
    const bookmarksStore = useBookmarksService();
    const { t } = useTranslation();

    const [category] = useState(bookmarksStore.categories.get(id));
    const [isSearching, setIsSearching] = useState(true);
    const [findBookmarks, setFindBookmarks] = useState(null);
    const buttonRef = useRef(null);
    const appStore = useAppService();

    const isPin = () => bookmarksStore.favorites.find((fav) => fav.type === 'category' && fav.id === id);

    const handlerContextMenu = (anchorEl) => {
        const { top, left } = buttonRef.current.getBoundingClientRect();
        appStore.eventBus.dispatch('contextMenu', {
            actions: [
                {
                    type: 'button',
                    title: isPin() ? t("fap.unpin") : t("fap.pin"),
                    icon: isPin() ? UnpinnedFavoriteIcon : PinnedFavoriteIcon,
                    onClick: () => {
                        if (isPin()) {
                            bookmarksStore.removeFromFavorites({ type: 'category', id });
                        } else {
                            bookmarksStore.addToFavorites({ type: 'category', id });
                        }
                    }
                },
                {
                    type: 'button',
                    title: t("edit"),
                    icon: EditIcon,
                    onClick: () => {
                        bookmarksStore.eventBus.dispatch(`editcategory`, { id, anchorEl });
                    }
                },
                {
                    type: 'button',
                    title: t("remove"),
                    icon: RemoveIcon,
                    onClick: () => {
                        bookmarksStore.eventBus.dispatch(`removecategory`, { id });
                    }
                }
            ],
            position: { top, left },
        });
    };

    useEffect(() => {
        bookmarksStore.bookmarks.query({ categories: { match: [id] } })
            .then((searchResult) => {
                setFindBookmarks(searchResult[0]?.bookmarks || []);
                setIsSearching(false);
            });
    }, []);

    return (
        <Card className={classes.root} elevation={16}>
            <CardHeader
                avatar={(
                    <LabelIcon style={{ color: category.color }} />
                )}
                title={category.name}
                classes={{ avatar: classes.avatar }}
                action={(
                    <IconButton
                        onClick={(event) => handlerContextMenu(event.currentTarget)}
                        ref={buttonRef}
                    >
                        <MoreIcon />
                    </IconButton>
                )}
            />
            <List disablePadding className={classes.list}>
                <Scrollbar>
                    {isSearching && (
                        <FullScreenStub style={{ height: 300 }}>
                            <CircularProgress />
                        </FullScreenStub>
                    )}
                    {!isSearching && findBookmarks.length === 0 && (
                        <FullScreenStub
                            style={{ height: 300 }}
                            message={t("fap.folder.emptyTitle")}
                            description={t("fap.folder.emptyDescription")}
                        />
                    )}
                    {findBookmarks && findBookmarks.map((bookmark, index) => (
                        <Link
                            key={bookmark.id}
                            {...bookmark}
                            divider={index !== findBookmarks.length - 1}
                        />
                    ))}
                </Scrollbar>
            </List>
        </Card>
    );
}

export default Folder;
