import React from 'react';
import PopperWrapper from '@/ui-components/PopperWrapper';
import { useLocalObservable, observer } from 'mobx-react-lite';
import Editor from './Editor';
import SimpleEditor from './EditorSimple';

function EditFolderModal(props) {
    const {
        anchorEl,
        isOpen,
        simple = false,
        onSave,
        onClose,
        popperProps = {},
        placement,
        ...other
    } = props;
    const store = useLocalObservable(() => ({ popperRef: null }));

    return (
        <PopperWrapper
            isOpen={isOpen}
            anchorEl={anchorEl}
            onClose={onClose}
            onService={(service) => { store.popperRef = service; }}
            popperProps={popperProps}
            placement={placement}
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
    );
}

export default observer(EditFolderModal);
