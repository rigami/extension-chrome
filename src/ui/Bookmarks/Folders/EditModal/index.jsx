import React from 'react';
import { Popper, ClickAwayListener } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useLocalObservable } from 'mobx-react-lite';
import Editor from './Editor';

const useStyles = makeStyles((theme) => ({ popper: { zIndex: theme.zIndex.modal } }));

function EditFolderModal(props) {
    const {
        anchorEl,
        isOpen,
        onSave,
        onClose,
        ...other
    } = props;
    const classes = useStyles();
    const store = useLocalObservable(() => ({ popperRef: null }));

    return (
        <ClickAwayListener
            onClickAway={onClose}
            mouseEvent="onMouseDown"
        >
            <Popper
                open={!!isOpen}
                anchorEl={anchorEl}
                popperRef={(popperRef) => { store.popperRef = popperRef; }}
                placement="top"
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
                    onCancel={onClose}
                    {...other}
                />
            </Popper>
        </ClickAwayListener>
    );
}

export default EditFolderModal;
