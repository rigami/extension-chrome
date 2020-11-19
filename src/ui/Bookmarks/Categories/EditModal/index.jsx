import React from 'react';
import { useLocalObservable, useObserver } from 'mobx-react-lite';
import Editor from './Editor';
import PopperWrapper from '@/ui-components/PopperWrapper';

function EditCategoryModal(props) {
    const {
        anchorEl,
        isOpen,
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
            <Editor
                onSave={(categoryId) => onSave && onSave(categoryId)}
                onError={() => store.popperRef.update()}
                {...other}
            />
        </PopperWrapper>
    ));
}

export default EditCategoryModal;
