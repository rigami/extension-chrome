import React, { useState, useEffect } from 'react';
import { ButtonBase, Popper, ClickAwayListener, ListItemAvatar, ListItemText, ListItem } from '@material-ui/core';
import { FolderRounded as FolderIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import useCoreService from '@/stores/BaseStateProvider';
import { useLocalObservable } from 'mobx-react-lite';
import Explorer from './Explorer';
import FAPButton from '@/ui/Bookmarks/FAP/Button';

const useStyles = makeStyles((theme) => ({
    root: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        borderRadius: theme.shape.borderRadiusBold,
        backgroundColor: theme.palette.common.white,
        // '&:hover': { backgroundColor: fade(theme.palette.common.white, 0.52) },
    },
    activeIconButton: {
        backgroundColor: theme.palette.common.white,
        // '&:hover': { backgroundColor: theme.palette.common.white },
    },
    popperWrapper: {
        zIndex: theme.zIndex.drawer,
        willChange: 'auto !important',
    },
    icon: {
        width: 32,
        height: 32,
        margin: theme.spacing(0.5),
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
    row: {
        margin: 0,
        padding: theme.spacing(1, 2),
        borderRadius: 0,
    },
}));

function Folder({ id, name, isBlurBackdrop, variant = 'icon', leftOffset = 0 }) {
    const classes = useStyles();
    const coreService = useCoreService();
    const [anchorEl, setAnchorEl] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isBlockEvent, setIsBlockEvent] = useState(false);
    const [listenId, setListenId] = useState(null);
    const store = useLocalObservable(() => ({ popperRef: null }));

    useEffect(() => {
        if (isOpen) {
            setListenId(coreService.localEventBus.on('system/scroll', () => {
                store.popperRef.update();
            }));
        } else {
            coreService.localEventBus.removeListener(listenId);
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
                    modifiers={{
                        flip: {
                            enabled: true,
                        },
                        preventOverflow: {
                            enabled: true,
                            boundariesElement: 'viewport',
                        },
                    }}
                >
                    <Explorer id={id} />
                </Popper>
            </ClickAwayListener>
            <FAPButton
                id={id}
                name={name}
                tooltip={name}
                isBlurBackdrop={isBlurBackdrop}
                type="folder"
                onMouseDown={() => {
                    if (!isOpen) setIsBlockEvent(true);
                }}
                onClick={(event) => {
                    setAnchorEl(event.currentTarget);
                    if (isBlockEvent) setIsOpen(true);
                    setIsBlockEvent(false);
                }}
            >
                {variant === 'row' ? (
                    <ListItem
                        ref={anchorEl}
                        button
                        className={classes.row}
                    >
                        <ListItemAvatar>
                            <FolderIcon />
                        </ListItemAvatar>
                        <ListItemText
                            primary={name}
                            classes={{
                                primary: classes.primaryText,
                                secondary: classes.secondaryText,
                            }}
                        />
                    </ListItem>
                ) : (
                    <ButtonBase
                        ref={anchorEl}
                        className={clsx(classes.root, isOpen && classes.activeIconButton)}
                    >
                        <FolderIcon className={classes.icon} />
                    </ButtonBase>
                )}
            </FAPButton>
        </React.Fragment>
    );
}

export default Folder;
