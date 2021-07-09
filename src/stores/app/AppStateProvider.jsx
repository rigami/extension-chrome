import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import AppService from '@/stores/app/AppState';
import useCoreService from '@/stores/app/BaseStateProvider';
import { SERVICE_STATE } from '@/enum';

const context = createContext({});

function AppStateProvider({ children, onChangeTheme }) {
    const coreService = useCoreService();
    const store = useLocalObservable(() => new AppService({ coreService }));
    const Context = context;
    const isFirstRender = useRef(true);
    const [state, setState] = useState(store.state);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        if (onChangeTheme) onChangeTheme(store.settings.theme);
    }, [store.settings.theme]);

    useEffect(() => {
        setState(store.state);
    }, [store.state]);

    return state === SERVICE_STATE.DONE && (
        <Context.Provider value={store}>
            {children}
        </Context.Provider>
    );
}

const observerProvider = observer(AppStateProvider);
const useService = () => useContext(context);

export default useService;
export { observerProvider as Provider };
