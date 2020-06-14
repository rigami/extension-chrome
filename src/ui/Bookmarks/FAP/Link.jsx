import React, { useState } from 'react'
import { IconButton } from '@material-ui/core';
import { LinkRounded as LinkIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { fade } from '@material-ui/core/styles/colorManipulator';
import clsx from 'clsx';
import EditMenu from '@/ui/Bookmarks/ContextEditMenu'

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
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState(null);

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
            <IconButton
                className={clsx(classes.root, isBlurBackdrop && classes.rootBlur)}
                onContextMenu={handlerContextMenu}
            >
                <LinkIcon />
            </IconButton>
        </React.Fragment>
    );
}

export default LinkButton;
