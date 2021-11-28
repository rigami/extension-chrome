import React, { createContext, useContext } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import SearchService from '@/ui/Bookmarks/searchService';

const context = createContext({});

function SearchServiceProvider({ children }) {
    const store = useLocalObservable(() => new SearchService());
    const Context = context;

    return (
        <Context.Provider value={store}>
            {children}
        </Context.Provider>
    );
}

const observerProvider = observer(SearchServiceProvider);
const useService = () => useContext(context);

export default useService;
export { observerProvider as SearchServiceProvider, useService as useSearchService };
