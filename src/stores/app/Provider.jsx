import React, { createContext } from 'preact/compat';
import { h } from 'preact';
import { observer, useLocalStore } from 'mobx-react-lite';
import AppConfigService from './service';

const context = createContext(undefined);

function AppConfigProvider({ children }) {
	const store = useLocalStore(() => new AppConfigService());
	const Context = context;

	return (
		<Context.Provider value={store}>
			{children}
		</Context.Provider>
	);
}

export { context };

export default observer(AppConfigProvider);
