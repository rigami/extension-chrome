import React, { createContext, useContext } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import NavigationService from './service';

const context = createContext({});

function NavigationProvider({ children }) {
    const store = useLocalObservable(() => new NavigationService());
    const Context = context;

    return (
        <Context.Provider value={store}>
            {children}
        </Context.Provider>
    );
}

const observerProvider = observer(NavigationProvider);
const useService = () => useContext(context);

export default useService;
export { observerProvider as NavigationProvider, useService as useNavigationService };
