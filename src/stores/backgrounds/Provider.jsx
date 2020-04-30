import React, { createContext } from 'preact/compat';
import { h } from 'preact';
import { observer, useLocalStore } from 'mobx-react-lite';
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

export { context };

export default observer(BackgroundsProvider);
