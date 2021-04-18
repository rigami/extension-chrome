import React from 'react';
import { Drawer } from '@material-ui/core';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import Editor from './Editor';

function EditBookmarkModal({ open, onClose, ...other }) {
    const { enqueueSnackbar } = useSnackbar();
    const { t } = useTranslation();

    return (
        <Drawer
            anchor="bottom"
            open={open}
            PaperProps={{
                elevation: 0,
                style: {
                    background: 'none',
                    height: '100%',
                },
            }}
            disableEnforceFocus
        >
            <Editor
                onSave={onClose}
                onCancel={onClose}
                onErrorLoad={() => {
                    enqueueSnackbar({
                        message: t('bookmark.errorLoad'),
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
