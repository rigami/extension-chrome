import React from 'react';
import { useLocalObservable, observer } from 'mobx-react-lite';
import PopperWrapper from '@/ui-components/PopperWrapper';
import Editor from './Editor';

function EditCategoryModal(props) {
    const {
        anchorEl,
        isOpen,
        onSave,
        onClose,
        ...other
    } = props;
    const store = useLocalObservable(() => ({ popperRef: null }));

    return (
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
    );
}

export default observer(EditCategoryModal);
