import React, {
    createContext,
    useContext,
    useState,
    useEffect,
} from 'react';
import { observer, useLocalObservable } from 'mobx-react-lite';
import WorkingSpaceService from '@/stores/app/workingSpace/service';
import { useCoreService } from '@/stores/app/core';
import { SERVICE_STATE } from '@/enum';

const context = createContext({});

function WorkingSpaceProvider({ children }) {
    const coreService = useCoreService();
    const store = useLocalObservable(() => new WorkingSpaceService(coreService));
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

const observerProvider = observer(WorkingSpaceProvider);
const useService = () => useContext(context);

export { observerProvider as WorkingSpaceProvider, useService as useWorkingSpaceService };
