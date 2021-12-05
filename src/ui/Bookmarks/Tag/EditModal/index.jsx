import React from 'react';
import { observer } from 'mobx-react-lite';
import PopperDialog from '@/ui-components/PopoverDialog';
import Editor from './Editor';

function EditTagModal(props) {
    const {
        anchorEl,
        isOpen,
        onSave,
        onClose,
        ...other
    } = props;

    return (
        <PopperDialog
            open={isOpen}
            onClose={onClose}
            anchorEl={anchorEl}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'center',
            }}
            transformOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
        >
            <Editor
                onSave={(tagId) => onSave && onSave(tagId)}
                {...other}
            />
        </PopperDialog>
    );
}

export default observer(EditTagModal);
