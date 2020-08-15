import React from 'react';
import { Drawer } from '@material-ui/core';
import Editor from './Editor';
import { useSnackbar } from 'notistack';

function EditBookmarkModal({ isOpen, onClose, ...other }) {
    const { enqueueSnackbar } = useSnackbar();

    return (
        <Drawer
            anchor="bottom"
            open={!!isOpen}
            PaperProps={{
                elevation: 0,
                style: { background: 'none', height: '100%' },
            }}
            disableEnforceFocus
        >
            <Editor
                onSave={onClose}
                onCancel={onClose}
                onErrorLoad={() => {
                    enqueueSnackbar({
                        message: t("bookmark.errorLoad"),
                        variant: 'error',
                    });
                    onClose();
                }}
                {...other}
            />
        </Drawer>
    );
}

export default EditBookmarkModal;
