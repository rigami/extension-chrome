import React, { createContext, useContext } from 'react';

import { observer, useLocalStore } from 'mobx-react-lite';
// import PropTypes from 'prop-types';
import BookmarksService from './service';

const context = createContext({});

function BookmarksProvider({ children }) {
    const store = useLocalStore(() => new BookmarksService());
    const Context = context;

    return (
        <Context.Provider value={store}>
            {children}
        </Context.Provider>
    );
}

// BookmarksProvider.propTypes = { children: PropTypes.element.isRequired };

const observerProvider = observer(BookmarksProvider);
const useService = () => useContext(context);

export {
    observerProvider as Provider,
    useService,
};
