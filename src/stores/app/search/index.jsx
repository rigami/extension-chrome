import React, { createContext, useContext } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import SearchService from './service';

const context = createContext({});

function SearchProvider({ children }) {
    const store = useLocalObservable(() => new SearchService());
    const Context = context;

    return (
        <Context.Provider value={store}>
            {children}
        </Context.Provider>
    );
}

const observerProvider = observer(SearchProvider);
const useService = () => useContext(context);

export default useService;
export { observerProvider as SearchProvider, useService as useSearchService };
