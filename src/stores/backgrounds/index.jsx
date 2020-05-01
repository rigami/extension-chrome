import React, { createContext, useContext } from 'preact/compat';
import { h } from 'preact';
import { observer, useLocalStore } from 'mobx-react-lite';
import PropTypes from 'prop-types';
import BackgroundsService from './service';

const context = createContext({});

function BackgroundsProvider({ children }) {
	const store = useLocalStore(() => new BackgroundsService());
	const Context = context;

	return (
		<Context.Provider value={store}>
			{children}
		</Context.Provider>
	);
}

BackgroundsProvider.propTypes = { children: PropTypes.element.isRequired };

const observerProvider = observer(BackgroundsProvider);
const useService = () => useContext(context);

export {
	observerProvider as Provider,
	useService,
};
