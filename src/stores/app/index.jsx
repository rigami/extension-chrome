import React, { createContext, useContext, useEffect } from 'preact/compat';
import { h } from 'preact';
import { observer, useLocalStore } from 'mobx-react-lite';
import PropTypes from 'prop-types';
import AppConfigService from './service';

const context = createContext({});

function AppConfigProvider({ children, onTheme }) {
	const store = useLocalStore(() => new AppConfigService());
	const Context = context;

	useEffect(() => onTheme(), [store.theme]);

	return (
		<Context.Provider value={store}>
			{children}
		</Context.Provider>
	);
}

AppConfigProvider.propTypes = {
	children: PropTypes.element.isRequired,
	onTheme: PropTypes.func.isRequired,
};

const observerProvider = observer(AppConfigProvider);
const useService = () => useContext(context);

export {
	observerProvider as Provider,
	useService,
};
