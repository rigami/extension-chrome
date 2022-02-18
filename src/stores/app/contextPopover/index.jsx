import React, { createContext, useContext, useState } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { useCoreService } from '@/stores/app/core';
import { useWorkingSpaceService } from '@/stores/app/workingSpace';
import ContextPopoverService from './service';
import ContextPopover from './ContextPopover';

const context = createContext();

function ContextPopoverProvider({ children }) {
    const coreService = useCoreService();
    const workingSpaceService = useWorkingSpaceService();
    const { t } = useTranslation();
    const service = useLocalObservable(() => new ContextPopoverService({
        coreService,
        workingSpaceService,
        t,
    }));
    const Context = context;

    return (
        <Context.Provider value={service.createDispatcher}>
            {children}
            {service.stateKeys.map((stateKey) => (
                <ContextPopover
                    key={stateKey}
                    stateKey={stateKey}
                    service={service}
                />
            ))}
        </Context.Provider>
    );
}

const observerProvider = observer(ContextPopoverProvider);
const useDispatcher = (fabric, options) => {
    const [key] = useState(() => Math.random(), []);

    const creator = useContext(context);

    if (!creator) return { };

    return creator(fabric, options, key);
};

export {
    observerProvider as ContextPopoverProvider,
    useDispatcher as useContextPopoverDispatcher,
};
