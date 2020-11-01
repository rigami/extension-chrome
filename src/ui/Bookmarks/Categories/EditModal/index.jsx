import React, { useEffect, useState } from 'react';
import {
    Popper,
    ClickAwayListener,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useLocalObservable } from 'mobx-react-lite';
import useCoreService from '@/stores/BaseStateProvider';
import Editor from './Editor';

const useStyles = makeStyles((theme) => ({ popper: { zIndex: theme.zIndex.modal } }));

function EditCategoryModal(props) {
    const {
        anchorEl,
        isOpen,
        onSave,
        onClose,
        ...other
    } = props;
    const classes = useStyles();
    const coreService = useCoreService();
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
        <ClickAwayListener
            onClickAway={onClose}
            mouseEvent="onMouseDown"
        >
            <Popper
                open={!!isOpen}
                anchorEl={anchorEl}
                popperRef={(popperRef) => { store.popperRef = popperRef; }}
                placement="bottom"
                className={classes.popper}
                modifiers={{
                    flip: { enabled: true },
                    preventOverflow: {
                        enabled: true,
                        boundariesElement: 'viewport',
                    },
                }}
            >
                <Editor
                    onSave={(categoryId) => onSave && onSave(categoryId)}
                    onError={() => store.popperRef.update()}
                    {...other}
                />
            </Popper>
        </ClickAwayListener>
    );
}

export default EditCategoryModal;
