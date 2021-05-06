import React from 'react';
import PopperDialog from '@/ui-components/PopoverDialog';
import Editor from './Editor';
import SimpleEditor from './EditorSimple';

function EditFolderModal(props) {
    const {
        anchorEl,
        isOpen,
        simple = false,
        onSave,
        onClose,
        placement,
        position,
        ...other
    } = props;

    return (
        <PopperDialog
            open={isOpen}
            onClose={onClose}
            anchorEl={anchorEl}
            anchorOrigin={{
                vertical: 'center',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'center',
                horizontal: 'left',
            }}
            {...(position ? {
                anchorReference: 'anchorPosition',
                anchorPosition: position,
                transformOrigin: {
                    vertical: 'top',
                    horizontal: 'left',
                },
            } : {})}
        >
            {simple ? (
                <SimpleEditor
                    onSave={(folderId) => onSave && onSave(folderId)}
                    onCancel={onClose}
                    {...other}
                />
            ) : (
                <Editor
                    onSave={(folderId) => onSave && onSave(folderId)}
                    onCancel={onClose}
                    {...other}
                />
            )}
        </PopperDialog>
    );
}

export default EditFolderModal;
