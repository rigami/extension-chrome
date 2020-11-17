import React, { useState, useEffect } from 'react';
import {
    ButtonBase,
    Popper,
    ClickAwayListener,
    Tooltip,
} from '@material-ui/core';
import {
    FolderRounded as FolderIcon,
    BookmarkBorderRounded as PinnedFavoriteIcon,
    BookmarkRounded as UnpinnedFavoriteIcon,
    EditRounded as EditIcon,
    DeleteRounded as RemoveIcon,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { fade } from '@material-ui/core/styles/colorManipulator';
import clsx from 'clsx';
import useCoreService from '@/stores/BaseStateProvider';
import { useLocalObservable } from 'mobx-react-lite';
import useBookmarksService from '@/stores/BookmarksProvider';
import { useTranslation } from 'react-i18next';
import Explorer from './Explorer';

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
    const coreService = useCoreService();
    const [anchorEl, setAnchorEl] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isBlockEvent, setIsBlockEvent] = useState(false);
    const [listenId, setListenId] = useState(null);
    const store = useLocalObservable(() => ({ popperRef: null }));
    const bookmarksService = useBookmarksService();
    const { t } = useTranslation();

    const isPin = () => bookmarksService.favorites.find((fav) => fav.type === 'folder' && fav.id === id);

    const handlerContextMenu = (event, anchorEl) => {
        event.preventDefault();
        coreService.localEventBus.call('system/contextMenu', {
            actions: [
                {
                    type: 'button',
                    title: isPin() ? t('fap.unpin') : t('fap.pin'),
                    icon: isPin() ? UnpinnedFavoriteIcon : PinnedFavoriteIcon,
                    onClick: () => {
                        if (isPin()) {
                            bookmarksService.removeFromFavorites({
                                type: 'folder',
                                id,
                            });
                        } else {
                            bookmarksService.addToFavorites({
                                type: 'folder',
                                id,
                            });
                        }
                    },
                },
                /* {
                    type: 'button',
                    title: t('edit'),
                    icon: EditIcon,
                    onClick: () => {
                        coreService.localEventBus.call('folder/edit', {
                            id,
                            anchorEl,
                        });
                    },
                },
                {
                    type: 'button',
                    title: t('remove'),
                    icon: RemoveIcon,
                    onClick: () => {
                        coreService.localEventBus.call('folder/remove', { id });
                    },
                }, */
            ],
            position: {
                top: event.nativeEvent.clientY,
                left: event.nativeEvent.clientX,
            },
        });
    };

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
                >
                    <Explorer id={id} />
                </Popper>
            </ClickAwayListener>
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
                    onContextMenu={(event) => handlerContextMenu(event, event.currentTarget)}
                >
                    <FolderIcon style={{ color }} className={classes.icon} />
                </ButtonBase>
            </Tooltip>
        </React.Fragment>
    );
}

export default Folder;
