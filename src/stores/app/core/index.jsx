import React, { createContext, useContext, useEffect } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import CoreService from './service';

const context = createContext({});

function CoreProvider({ side, children }) {
    const store = useLocalObservable(() => new CoreService({ side }));
    const Context = context;

    if (PRODUCTION_MODE) {
        window.oncontextmenu = (event) => {
            event.preventDefault();
        };
    }
    window.addEventListener('mousedown', (mouseEvent) => {
        if (mouseEvent.button !== 1) return;

        mouseEvent.preventDefault();
        mouseEvent.stopPropagation();
    }, true);

    useEffect(() => {
        store.globalEventBus.on('system.forceReload', () => {
            location.reload();
        });
    }, []);

    return (
        <Context.Provider value={store}>
            {children}
        </Context.Provider>
    );
}

const observerProvider = observer(CoreProvider);
const useService = () => useContext(context);

export { observerProvider as CoreProvider, useService as useCoreService };
