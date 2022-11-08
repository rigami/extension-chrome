import React, { createContext, useContext, useState } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { useCoreService } from '@/stores/app/core';
import { useWorkingSpaceService } from '@/stores/app/workingSpace';
import ContextMenuService from './service';
import ContextMenu from './ContextMenu';

const context = createContext();

function ContextMenuProvider({ children }) {
    const coreService = useCoreService();
    const workingSpaceService = useWorkingSpaceService();
    const { t } = useTranslation();

    const service = useLocalObservable(() => new ContextMenuService({
        coreService,
        workingSpaceService,
        t,
    }));
    const Context = context;

    return (
        <Context.Provider value={service.createDispatcher}>
            {children}
            <ContextMenu service={service} />
        </Context.Provider>
    );
}

const observerProvider = observer(ContextMenuProvider);

function useService(fabric, options) {
    const [stateKey] = useState(() => Math.random().toString(), []);

    const creator = useContext(context);

    if (!creator) return { };

    return creator(fabric, options, stateKey);
}

export { observerProvider as ContextMenuProvider, useService as useContextMenuService };
