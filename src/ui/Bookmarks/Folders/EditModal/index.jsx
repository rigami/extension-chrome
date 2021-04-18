import React from 'react';
import PopperWrapper from '@/ui-components/PopperWrapper';
import { useLocalObservable, observer } from 'mobx-react-lite';
import ReactResizeDetector from 'react-resize-detector';
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
    const store = useLocalObservable(() => ({ popper: null }));

    const updatePopper = () => {
        if (!store.popper) return;

        requestAnimationFrame(() => {
            store.popper.update();
        });
    };

    return (
        <PopperWrapper
            isOpen={isOpen}
            anchorEl={anchorEl}
            onClose={onClose}
            onService={(service) => { store.popper = service; }}
            popperProps={popperProps}
            placement={placement}
        >
            <ReactResizeDetector handleWidth handleHeight onResize={updatePopper}>
                {simple ? (
                    <SimpleEditor
                        onSave={(folderId) => onSave && onSave(folderId)}
                        onError={() => store.popper.update()}
                        onCancel={onClose}
                        {...other}
                    />
                ) : (
                    <Editor
                        onSave={(folderId) => onSave && onSave(folderId)}
                        onError={() => store.popper.update()}
                        onCancel={onClose}
                        {...other}
                    />
                )}
            </ReactResizeDetector>
        </PopperWrapper>
    );
}

export default observer(EditFolderModal);
