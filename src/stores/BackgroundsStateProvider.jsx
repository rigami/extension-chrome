import React, { createContext, useContext } from 'react';
import { observer, useLocalStore } from 'mobx-react-lite';
import BackgroundsService from '@/stores/backgrounds';
import useCoreService from '@/stores/BaseStateProvider';

const context = createContext({});

function BackgroundsStateProvider({ children }) {
    const coreService = useCoreService();
    const store = useLocalStore(() => new BackgroundsService(coreService));
    const Context = context;

    return store.settings.isSync && (
        <Context.Provider value={store}>
            {children}
        </Context.Provider>
    );
}

const observerProvider = observer(BackgroundsStateProvider);
const useService = () => useContext(context);

export default useService;
export { observerProvider as Provider };
