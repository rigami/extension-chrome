import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
} from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import AppService from '@/stores/app';

const context = createContext({});

function AppStateProvider({ children, onChangeTheme }) {
    const store = useLocalObservable(() => new AppService());
    const Context = context;
    const isFirstRender = useRef(true);

    useEffect(() => {
        console.log('Change app theme', store.settings.theme);

        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        if (onChangeTheme) onChangeTheme(store.settings.theme);
    }, [store.settings.theme]);

    return store.settings.isSync && (
        <Context.Provider value={store}>
            {children}
        </Context.Provider>
    );
}

const observerProvider = observer(AppStateProvider);
const useService = () => useContext(context);

export default useService;
export { observerProvider as Provider };
