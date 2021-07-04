import React, {
    createContext,
    useContext,
    useState,
    useEffect,
} from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import BookmarksService from '@/stores/app/bookmarks';
import useCoreService from '@/stores/app/BaseStateProvider';
import { SERVICE_STATE } from '@/enum';

const context = createContext({});

function BookmarksStateProvider({ children }) {
    const coreService = useCoreService();
    const store = useLocalObservable(() => new BookmarksService(coreService));
    const Context = context;
    const [state, setState] = useState(store.settings.state);

    useEffect(() => {
        setState(store.settings.state);
    }, [store.settings.state]);

    return state === SERVICE_STATE.DONE && (
        <Context.Provider value={store}>
            {children}
        </Context.Provider>
    );
}

const observerProvider = observer(BookmarksStateProvider);
const useService = () => useContext(context);

export default useService;
export { observerProvider as Provider };
