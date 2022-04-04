import React, { createContext, useContext, useEffect } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { useCoreService } from '@/stores/app/core';
import { useWorkingSpaceService } from '@/stores/app/workingSpace';
import HotKeysService from './service';

const context = createContext();

function HotKeysProvider({ children }) {
    const coreService = useCoreService();
    const workingSpaceService = useWorkingSpaceService();
    const { t } = useTranslation();

    const service = useLocalObservable(() => new HotKeysService({
        coreService,
        workingSpaceService,
        t,
    }));
    const Context = context;

    useEffect(() => {
        addEventListener('keydown', service._keyDown.bind(service));
        addEventListener('keyup', service._keyUp.bind(service));
        addEventListener('blur', service._resetAllKeys.bind(service));

        return () => {
            removeEventListener('keydown', service._keyDown.bind(service));
            removeEventListener('keyup', service._keyUp.bind(service));
            removeEventListener('blur', service._resetAllKeys.bind(service));
        };
    }, []);

    return (
        <Context.Provider value={service}>
            {children}
        </Context.Provider>
    );
}

const observerProvider = observer(HotKeysProvider);

const useService = () => useContext(context);

export { observerProvider as HotKeysProvider, useService as useHotKeysService };
