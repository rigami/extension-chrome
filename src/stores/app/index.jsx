import React, { createContext, useContext } from 'preact/compat';
import { h } from 'preact';
import { observer, useLocalStore } from 'mobx-react-lite';
import PropTypes from 'prop-types';
import AppConfigService from './service';

const context = createContext({});

function AppConfigProvider({ children }) {
	const store = useLocalStore(() => new AppConfigService());
	const Context = context;

	return (
		<Context.Provider value={store}>
			{children}
		</Context.Provider>
	);
}

AppConfigProvider.propTypes = { children: PropTypes.element.isRequired };

const observerProvider = observer(AppConfigProvider);
const useService = () => useContext(context);

export {
	observerProvider as Provider,
	useService,
};
