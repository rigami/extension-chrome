import React, { useState, useEffect } from 'react';
import {
    ButtonBase,
    Popper,
    ClickAwayListener,
    Tooltip,
} from '@material-ui/core';
import { FolderRounded as FolderIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { fade } from '@material-ui/core/styles/colorManipulator';
import clsx from 'clsx';
import Explorer from './Explorer';
import EditMenu from '@/ui/Bookmarks/ContextEditMenu'
import {useService as useAppService} from "@/stores/app";
import { useLocalStore } from 'mobx-react-lite';

const useStyles = makeStyles((theme) => ({
    root: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        padding: theme.spacing(0.5),
        borderRadius: theme.shape.borderRadiusBold,
        backgroundColor: theme.palette.common.white,
        // '&:hover': { backgroundColor: fade(theme.palette.common.white, 0.52) },
    },
    rootBlur: { backdropFilter: 'blur(10px) brightness(130%)' },
    activeIconButton: {
        backgroundColor: theme.palette.common.white,
        // '&:hover': { backgroundColor: theme.palette.common.white },
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
    icon: {
        width: 32,
        height: 32,
    },
}));

function Folder({ id, name, color, isBlurBackdrop }) {
    const classes = useStyles();
    const appService = useAppService();
    const [anchorEl, setAnchorEl] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isBlockEvent, setIsBlockEvent] = useState(false);
    const [isOpenMenu, setIsOpenMenu] = useState(false);
    const [position, setPosition] = useState(null);
    const [listenId, setListenId] = useState(null);
    const store = useLocalStore(() => ({
        popperRef: null,
    }));

    const handlerContextMenu = (event) => {
        event.preventDefault();
        setPosition({
            top: event.nativeEvent.clientY,
            left: event.nativeEvent.clientX,
        });
        setIsOpenMenu(true);
    };

    const handleCloseMenu = () => {
        setIsOpenMenu(false);
    };

    useEffect(() => {
        if (isOpen) {
            setListenId(appService.eventBus.on('scroll', () => {
                store.popperRef.update();
            }));
        } else {
            appService.eventBus.removeListener(listenId);
        }
    }, [isOpen]);

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
                    open={isOpen}
                    anchorEl={anchorEl}
                    popperRef={(popperRef) => { store.popperRef = popperRef; }}
                    placement="top"
                    className={classes.popperWrapper}
                >
                    <Explorer id={id} />
                </Popper>
            </ClickAwayListener>
            <EditMenu
                id={id}
                type="category"
                isOpen={isOpenMenu}
                onClose={handleCloseMenu}
                position={position}
            />
            <Tooltip
                title={name}
                enterDelay={400}
                enterNextDelay={400}
            >
                <ButtonBase
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
                    onContextMenu={handlerContextMenu}
                >
                    <FolderIcon style={{ color }} className={classes.icon} />
                </ButtonBase>
            </Tooltip>
        </React.Fragment>
    );
}

export default Folder;
