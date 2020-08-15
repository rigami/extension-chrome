import React, { useEffect, useState } from 'react';
import {
    Popper,
    ClickAwayListener,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import Editor from "./Editor";
import { useLocalStore } from 'mobx-react-lite';
import {useService as useAppService} from "@/stores/app";

const useStyles = makeStyles((theme) => ({
    popper: { zIndex: theme.zIndex.modal },
}));

function EditCategoryModal({ anchorEl, isOpen, onSave, onClose, ...other }) {
    const classes = useStyles();
    const appService = useAppService();
    const [listenId, setListenId] = useState(null);
    const store = useLocalStore(() => ({
        popperRef: null,
    }));

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
                    flip: {
                        enabled: true,
                    },
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
