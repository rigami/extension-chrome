import React, { useEffect, useState } from 'react';
import { Popper, ClickAwayListener } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useLocalObservable } from 'mobx-react-lite';
import useCoreService from '@/stores/app/BaseStateProvider';

const useStyles = makeStyles((theme) => ({
    popper: {
        zIndex: theme.zIndex.modal,
        willChange: 'auto !important',
        maxWidth: 'calc(100vw - 32px)',
        maxHeight: 'calc(100vh - 32px)',
    },
}));

export const TARGET_CLICK = {
    OUTSIDE: 'OUTSIDE',
    ANCHOR: 'ANCHOR',
};

function PopperWrapper(props) {
    const {
        anchorEl,
        isOpen,
        modifiers = {},
        popperProps = {},
        placement = 'top',
        onClose,
        onService,
        children,
    } = props;
    const classes = useStyles();
    const coreService = useCoreService();
    const [listenId, setListenId] = useState(null);
    const store = useLocalObservable(() => ({ popperRef: null }));

    const handleClose = (event) => {
        onClose(event.path.indexOf(anchorEl) !== -1 ? TARGET_CLICK.ANCHOR : TARGET_CLICK.OUTSIDE);
    };

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
            onClickAway={handleClose}
            mouseEvent="onMouseDown"
        >
            <Popper
                open={!!isOpen}
                anchorEl={anchorEl}
                popperRef={(popperRef) => {
                    store.popperRef = popperRef;
                    if (onService) onService(popperRef);
                }}
                placement={placement}
                className={classes.popper}
                modifiers={{
                    flip: {
                        enabled: true,
                        padding: 16,
                    },
                    preventOverflow: {
                        enabled: true,
                        padding: 16,
                        boundariesElement: 'viewport',
                        priority: [
                            'left',
                            'right',
                            'top',
                            'bottom',
                        ],
                    },
                    offset: {
                        enabled: true,
                        offset: '0, 16px',
                    },
                    ...modifiers,
                }}
                {...popperProps}
            >
                {children}
            </Popper>
        </ClickAwayListener>
    );
}

export default PopperWrapper;
