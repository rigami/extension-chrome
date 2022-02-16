import React, { createContext, useContext, useState } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { useCoreService } from '@/stores/app/core';
import ContextMenuService from './service';
import { useWorkingSpaceService } from '@/stores/app/workingSpace';
import ContextMenu from '@/ui/ContextMenu';

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
        <Context.Provider value={service.createContextMenu}>
            {children}
            <ContextMenu service={service} />
        </Context.Provider>
    );
}

const observerProvider = observer(ContextMenuProvider);
const useService = (fabric, options) => {
    const [key] = useState(() => Math.random(), []);

    const creator = useContext(context);

    if (!creator) return { };

    return creator(fabric, options, key);
};

export { observerProvider as ContextMenuProvider, useService as useContextMenuService };
