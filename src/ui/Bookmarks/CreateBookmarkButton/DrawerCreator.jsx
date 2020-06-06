import React from 'react';
import { Drawer } from '@material-ui/core';
import Creator from './Creator';

function CreateBookmarkModal({ isOpen, onClose }) {
    return (
        <Drawer
            anchor="bottom"
            open={isOpen}
            PaperProps={{
                elevation: 0,
                style: { background: 'none' },
            }}
            onClose={onClose}
            disableEnforceFocus
        >
            <Creator onSave={onClose} onCancel={onClose} />
        </Drawer>
    );
}

export default CreateBookmarkModal;
