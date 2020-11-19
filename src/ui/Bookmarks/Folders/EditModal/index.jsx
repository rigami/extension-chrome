import React from 'react';
import Editor from './Editor';
import SimpleEditor from  './EditorSimple';
import PopperWrapper from '@/ui-components/PopperWrapper';
import { useLocalObservable, useObserver } from 'mobx-react-lite';

function EditFolderModal(props) {
    const {
        anchorEl,
        isOpen,
        simple = false,
        onSave,
        onClose,
        ...other
    } = props;
    const store = useLocalObservable(() => ({ popperRef: null }));

    return useObserver(() => (
        <PopperWrapper
            isOpen={isOpen}
            anchorEl={anchorEl}
            onClose={onClose}
            onService={(service) => { store.popperRef = service; }}
        >
            {simple ? (
                <SimpleEditor
                    onSave={(folderId) => onSave && onSave(folderId)}
                    onError={() => store.popperRef.update()}
                    onCancel={onClose}
                    {...other}
                />
            ) : (
                <Editor
                    onSave={(folderId) => onSave && onSave(folderId)}
                    onError={() => store.popperRef.update()}
                    onCancel={onClose}
                    {...other}
                />
            )}
        </PopperWrapper>
    ));
}

export default EditFolderModal;
