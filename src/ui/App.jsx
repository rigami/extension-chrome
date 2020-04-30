import React, { useState } from 'preact/compat';
import { h, render } from 'preact';
import { CssBaseline } from '@material-ui/core';
import { Provider } from 'mobx-react';
import { SnackbarProvider } from 'notistack';

import Menu from '@/ui/Menu';
import Desktop from '@/ui/Desktop';
import { ThemeProvider } from '@material-ui/styles';
import Snackbar from '@/ui-components/Snackbar';
import UploadBGForm from '@/ui-components/UploadBGForm';
import ConfigurationApp from '@/hoc/ConfigurationApp';
import { THEME } from '@/dict';
import lightTheme from '@/themes/defaultTheme';
import darkTheme from '@/themes/darkTheme';

function App() {
	const [theme, setTheme] = useState(localStorage.getItem('app_theme') === THEME.DARK ? darkTheme : lightTheme);

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<ConfigurationApp>
				{(stores) => {
					stores.appConfigStore._onChangeTheme = () => {
						setTheme(localStorage.getItem('app_theme') === THEME.DARK ? darkTheme : lightTheme);
					};

					return (
						<Provider {...stores}>
							<SnackbarProvider
								maxSnack={4}
								content={(key, options) => (
									<Snackbar id={key} {...options} />
								)}
							>
								<UploadBGForm>
									<Desktop />
									<Menu />
								</UploadBGForm>
							</SnackbarProvider>
						</Provider>
					);
				}}
			</ConfigurationApp>
		</ThemeProvider>
	);
}

render(<App />, document.body);
