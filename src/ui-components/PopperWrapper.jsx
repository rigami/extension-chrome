import React, { useEffect, useState } from 'react';
import { Popper, ClickAwayListener } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useLocalObservable } from 'mobx-react-lite';
import useCoreService from '@/stores/BaseStateProvider';

const useStyles = makeStyles((theme) => ({
    popper: {
        zIndex: theme.zIndex.modal,
        willChange: 'auto !important',
    },
}));

function PopperWrapper(props) {
    const {
        anchorEl,
        isOpen,
        modifiers = {},
        onClose,
        onService,
        children,
    } = props;
    const classes = useStyles();
    const coreService = useCoreService();
    const [listenId, setListenId] = useState(null);
    const store = useLocalObservable(() => ({ popperRef: null }));

    useEffect(() => {
        if (isOpen) {
            setListenId(coreService.localEventBus.on('system/scroll', () => {
                if (store.popperRef) store.popperRef.update();
            }));
        } else {
            coreService.localEventBus.removeListener(listenId);
        }
    }, [isOpen]);

    return (
        <ClickAwayListener
            onClickAway={onClose}
            mouseEvent="onMouseDown"
        >
            <Popper
                open={!!isOpen}
                anchorEl={anchorEl}
                popperRef={(popperRef) => {
                    store.popperRef = popperRef;
                    if (onService) onService(popperRef);
                }}
                placement="top"
                className={classes.popper}
                modifiers={{
                    flip: {
                        enabled: true,
                        padding: 16,
                    },
                    preventOverflow: {
                        enabled: true,
                        boundariesElement: 'viewport',
                    },
                    ...modifiers,
                }}
            >
                {children}
            </Popper>
        </ClickAwayListener>
    );
}

export default PopperWrapper;
