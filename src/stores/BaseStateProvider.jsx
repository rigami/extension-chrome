import React, { createContext, useContext, useEffect } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import CoreAppService from '@/stores/core';

const context = createContext({});

function BaseStateProvider({ side, children }) {
    const store = useLocalObservable(() => new CoreAppService({ side }));
    const Context = context;

    useEffect(() => {
        if (PRODUCTION_MODE) {
            window.oncontextmenu = (event) => {
                event.preventDefault();
            };
        }
        window.addEventListener('mousedown', function(mouseEvent) {
            if(mouseEvent.button !== 1) return;

            mouseEvent.preventDefault();
            mouseEvent.stopPropagation();
        }, true);
    }, []);

    return (
        <Context.Provider value={store}>
            {children}
        </Context.Provider>
    );
}

const observerProvider = observer(BaseStateProvider);
const useService = () => useContext(context);

export default useService;
export { observerProvider as Provider };
