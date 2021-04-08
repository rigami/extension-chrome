import React, { useEffect, useRef, useState } from 'react';
import useCoreService from '@/stores/app/BaseStateProvider';

function EditBookmarkModal() {
    const coreService = useCoreService();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoad, setIsLoad] = useState(false);
    const [options, setOptions] = useState({});
    const editor = useRef(null);

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleOpen = async () => {
        if (editor.current) {
            setIsOpen(true);
            return;
        }

        setIsLoad(true);

        editor.current = (await import('./DrawerEditor')).default;
        setIsLoad(false);
        setIsOpen(true);
    };

    useEffect(() => {
        const listeners = [
            coreService.localEventBus.on('bookmark/edit', ({ id }) => {
                setOptions({ editBookmarkId: id });
                handleOpen();
            }),
            coreService.localEventBus.on('bookmark/create', (editOptions = {}) => {
                setOptions(editOptions);
                handleOpen();
            }),
        ];

        return () => listeners.forEach((listenerId) => coreService.localEventBus.removeListener(listenerId));
    }, []);

    if (isLoad || !editor.current) return null;

    return (
        <editor.current
            open={isOpen}
            onClose={handleClose}
            {...(options || {})}
        />
    );
}

export default EditBookmarkModal;
