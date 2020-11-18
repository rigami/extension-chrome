import React, { useState, useEffect } from 'react';
import { ButtonBase, Popper, ClickAwayListener } from '@material-ui/core';
import { LabelRounded as TagIcon } from '@material-ui/icons';
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
}));

function Category({ id, name, color, isBlurBackdrop }) {
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
                >
                    <Explorer id={id} />
                </Popper>
            </ClickAwayListener>
            <FAPButton
                id={id}
                name={name}
                tooltip={name}
                isBlurBackdrop={isBlurBackdrop}
                type="category"
            >
                <ButtonBase
                    ref={anchorEl}
                    onMouseDown={() => {
                        if (!isOpen) setIsBlockEvent(true);
                    }}
                    className={clsx(classes.root, isOpen && classes.activeIconButton)}
                    onClick={(event) => {
                        setAnchorEl(event.currentTarget);
                        if (isBlockEvent) setIsOpen(true);
                        setIsBlockEvent(false);
                    }}
                >
                    <TagIcon style={{ color }} className={classes.icon} />
                </ButtonBase>
            </FAPButton>
        </React.Fragment>
    );
}

export default Category;
