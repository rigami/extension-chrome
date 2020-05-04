import React, { useState } from 'preact/compat';
import { h, render } from 'preact';
import { CssBaseline } from '@material-ui/core';
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
import Nest from '@/utils/Nest';
import { Provider as BackgroundsProvider } from '@/stores/backgrounds';
import { Provider as AppConfigProvider } from '@/stores/app';

function App() {
	const [theme, setTheme] = useState(localStorage.getItem('app_theme'));

	return (
		<ThemeProvider theme={theme === THEME.DARK ? darkTheme : lightTheme}>
			<CssBaseline />
			<Nest components={[
				ConfigurationApp,
				BackgroundsProvider,
				({ children }) => (
					<AppConfigProvider onTheme={() => setTheme(localStorage.getItem('app_theme'))} >
						{children}
					</AppConfigProvider>
				),
				({ children }) => (
					<SnackbarProvider
						maxSnack={4}
						content={(key, options) => (
							<Snackbar id={key} {...options} />
						)}
					>
						{children}
					</SnackbarProvider>
				),
				UploadBGForm,
			]}>
				<Desktop />
				<Menu />
			</Nest>
		</ThemeProvider>
	);
}

render(<App />, document.body);
