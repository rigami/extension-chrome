import React, { useState, useEffect } from 'react'
import { IconButton, Tooltip, Typography, CircularProgress } from '@material-ui/core';
import { LinkRounded as LinkIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { fade } from '@material-ui/core/styles/colorManipulator';
import clsx from 'clsx';
import EditMenu from '@/ui/Bookmarks/ContextEditMenu'
import { observer } from 'mobx-react-lite';
import {useService as useBookmarksService} from "@/stores/bookmarks";

const useStyles = makeStyles((theme) => ({
    root: {
        marginRight: theme.spacing(1),
        padding: theme.spacing(1),
        backgroundColor: fade(theme.palette.common.white, 0.32),
        '&:hover': { backgroundColor: fade(theme.palette.common.white, 0.52) },
    },
    rootBlur: { backdropFilter: 'blur(10px) brightness(130%)' },
}));

function LinkButton({ id, isBlurBackdrop }) {
    const classes = useStyles();
    const bookmarksService = useBookmarksService();
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState(null);
    const [bookmark, setBookmark] = useState(null);

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

    const handleClick = (event) => {
        if (!bookmark) return;

        if (event.button === 1) {
            window.open(bookmark.url);
        } else if (event.button === 0) {
            window.open(bookmark.url, "_self");
        }
    };

    useEffect(() => {
        bookmarksService.getBookmark(id)
            .then((bkm) => {
                setBookmark(bkm);
            });
    }, []);

    if (!bookmark) {
        return (
            <IconButton className={clsx(classes.root, isBlurBackdrop && classes.rootBlur)} >
                <CircularProgress size={24} />
            </IconButton>
        );
    }


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
                        {bookmark.name}
                        <br />
                        <Typography variant="caption">{bookmark.url}</Typography>
                    </React.Fragment>
                )}
                enterDelay={400}
                enterNextDelay={400}
            >
                <IconButton
                    className={clsx(classes.root, isBlurBackdrop && classes.rootBlur)}
                    onMouseUp={handleClick}
                    onContextMenu={handlerContextMenu}
                >
                    <LinkIcon />
                </IconButton>
            </Tooltip>
        </React.Fragment>
    );
}

export default observer(LinkButton);
