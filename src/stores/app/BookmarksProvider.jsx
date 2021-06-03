import React, { createContext, useContext } from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import BookmarksService from '@/stores/app/bookmarks';
import useCoreService from '@/stores/app/BaseStateProvider';
import { SERVICE_STATE } from '@/enum';

const context = createContext({});

function BookmarksStateProvider({ children }) {
    const coreService = useCoreService();
    const store = useLocalObservable(() => new BookmarksService(coreService));
    const Context = context;

    if (store.settings.state !== SERVICE_STATE.DONE) {
        return null;
    }

    return (
        <Context.Provider value={store}>
            {children}
        </Context.Provider>
    );
}

const observerProvider = observer(BookmarksStateProvider);
const useService = () => useContext(context);

export default useService;
export { observerProvider as Provider };
