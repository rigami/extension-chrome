import React from 'react';
import { Drawer } from '@material-ui/core';
import EditorBookmark from './EditorBookmark';

function EditBookmarkModal({ isOpen, onClose, ...other }) {
    return (
        <Drawer
            anchor="bottom"
            open={!!isOpen}
            PaperProps={{
                elevation: 0,
                style: { background: 'none' },
            }}
            disableEnforceFocus
        >
            <EditorBookmark onSave={onClose} onCancel={onClose} {...other} />
        </Drawer>
    );
}

export default EditBookmarkModal;
