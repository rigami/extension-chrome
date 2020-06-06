import React, { useState } from 'react';
import {
    IconButton,
    Popper,
    ClickAwayListener,
} from '@material-ui/core';
import { FolderRounded as FolderIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { fade } from '@material-ui/core/styles/colorManipulator';
import clsx from 'clsx';
import Explorer from './Explorer';

const useStyles = makeStyles((theme) => ({
    root: {
        marginRight: theme.spacing(1),
        padding: theme.spacing(1),
        backgroundColor: fade(theme.palette.common.white, 0.32),
        '&:hover': { backgroundColor: fade(theme.palette.common.white, 0.52) },
    },
    rootBlur: { backdropFilter: 'blur(10px) brightness(130%)' },
    activeIconButton: {
        backgroundColor: theme.palette.common.white,
        '&:hover': { backgroundColor: theme.palette.common.white },
    },
    popperWrapper: {
        zIndex: theme.zIndex.drawer,
        willChange: 'auto !important',
    },
    popper: {
        width: 310,
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
        backdropFilter: 'blur(15px) brightness(130%)',
        backgroundColor: fade(theme.palette.background.default, 0.70),
    },
    emptyTitle: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(2),
    },
}));

function Folder({ id, color, isBlurBackdrop }) {
    const classes = useStyles();

    const [anchorEl, setAnchorEl] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isBlockEvent, setIsBlockEvent] = useState(false);

    return (
        <React.Fragment>
            <ClickAwayListener
                onClickAway={() => {
                    if (isBlockEvent) return;

                    setIsOpen(false);
                }}
                mouseEvent="onMouseDown"
            >
                <Popper
                    open={isOpen} anchorEl={anchorEl} placement="top"
                    className={classes.popperWrapper}
                >
                    <Explorer id={id} />
                </Popper>
            </ClickAwayListener>
            <IconButton
                ref={anchorEl}
                className={clsx(classes.root, isOpen && classes.activeIconButton, isBlurBackdrop && classes.rootBlur)}
                onMouseDown={() => {
                    if (!isOpen) setIsBlockEvent(true);
                }}
                onClick={(event) => {
                    setAnchorEl(event.currentTarget);
                    if (isBlockEvent) setIsOpen(true);
                    setIsBlockEvent(false);
                }}
            >
                <FolderIcon style={{ color }} />
            </IconButton>
        </React.Fragment>
    );
}

export default Folder;
