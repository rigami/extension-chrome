import React, { useState, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useCoreService } from '@/stores/app/core';

function Menu({ }) {
    const coreService = useCoreService();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoad, setIsLoad] = useState(false);
    const menu = useRef(null);

    const handleClose = () => {
        setIsOpen(false);
    };

    const handleOpen = async () => {
        if (menu.current) {
            setIsOpen(true);
            return;
        }

        setIsLoad(true);

        menu.current = (await import('./DrawerMenu')).default;
        setIsLoad(false);
        setIsOpen(true);
    };

    useEffect(() => {
        const listenerId = coreService.localEventBus.on('settings/open', () => {
            handleOpen();
        });

        return () => coreService.localEventBus.removeListener(listenerId);
    }, []);

    if (isLoad || !menu.current) return null;

    return (
        <menu.current open={isOpen} onClose={handleClose} />
    );
}

export default observer(Menu);
