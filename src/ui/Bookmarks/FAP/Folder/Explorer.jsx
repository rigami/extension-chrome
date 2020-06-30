import React, { useState, useEffect, useRef } from 'react';
import {
    Card,
    CardHeader,
    Avatar,
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
    LinkRounded as LinkIcon,
    LabelRounded as LabelIcon,
    MoreVertRounded as MoreIcon,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { useService as useBookmarksService } from '@/stores/bookmarks';
import Scrollbar from '@/ui-components/CustomScroll';
import FullScreenStub from '@/ui-components/FullscreenStub';
import EditMenu from '@/ui/Bookmarks/ContextEditMenu'
import Image from "@/ui-components/Image";

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
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState(null);

    const handleClick = (event) => {
        if (event.button === 1) {
            window.open(url);
        } else if (event.button === 0) {
            window.open(url, "_self");
        }
    };

    const handlerContextMenu = (event) => {
        event.preventDefault();
        setPosition({
            top: event.nativeEvent.clientY,
            left: event.nativeEvent.clientX,
        });
        setIsOpen(true);
    };

    const handleCloseMenu = () => {
        setIsOpen(false);
    };

    return (
        <React.Fragment>
            <EditMenu
                id={id}
                type="bookmark"
                isOpen={isOpen}
                onClose={handleCloseMenu}
                position={position}
            />
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
        </React.Fragment>
    );
}

function Folder({ id }) {
    const classes = useStyles();
    const bookmarksStore = useBookmarksService();

    const [category] = useState(bookmarksStore.getCategory(id));
    const [isSearching, setIsSearching] = useState(true);
    const [findBookmarks, setFindBookmarks] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState(null);
    const buttonRef = useRef(null);

    const handleOpen = () => {
        const { top, left } = buttonRef.current.getBoundingClientRect();
        setPosition({ top, left });
        setIsOpen(true);
    };

    const handleCloseMenu = () => {
        setIsOpen(false);
    };

    useEffect(() => {
        bookmarksStore.search({ categories: [id] }, true)
            .then((searchResult) => {
                setFindBookmarks(searchResult[0]?.bookmarks || []);
                setIsSearching(false);
            });
    }, []);

    return (
        <Card className={classes.root} elevation={16}>
            <EditMenu
                id={id}
                type="category"
                isOpen={isOpen}
                onClose={handleCloseMenu}
                position={position}
            />
            <CardHeader
                avatar={(
                    <LabelIcon style={{ color: category.color }} />
                )}
                title={category.name}
                classes={{ avatar: classes.avatar }}
                action={(
                    <IconButton
                        onClick={handleOpen}
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
                            message="Здесть пока пусто"
                            description="В этой категории еще нет закладок"
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
