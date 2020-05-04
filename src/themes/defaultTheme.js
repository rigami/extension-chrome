import { createMuiTheme } from '@material-ui/core/styles';
import { fade } from '@material-ui/core/styles/colorManipulator';

const theme = {
	palette: {
		type: 'light',
		primary: {
			main: '#2675F0',
			contrastText: '#fff',
		},
		secondary: {
			main: '#8526D0',
			contrastText: '#fff',
		},
		warning: {
			main: '#f46600',
			contrastText: '#fff',
		},
		snackbar: { default: fade('#fff', 0.95) },
	},
	typography: {
		fontFamily: localStorage.getItem('app_use_system_font') === 'true' ? 'system-ui' : 'Roboto, sans-serif',
		h5: { fontWeight: 700 },
		h6: { fontWeight: 700 },
	},
	overrides: {
		MuiButton: { label: { fontWeight: 700 } },
		MuiTypography: { gutterBottom: { marginBottom: '0.8em' } },
		MuiTooltip: {
			tooltip: {
				backgroundColor: fade('#000', 0.82),
				fontSize: '0.85rem',
				padding: '6px 12px',
			},
		},
		MuiSwitch: {
			thumb: { boxShadow: 'none' },
			switchBase: { color: '#5e5e5e' },
		},
	},
	props: { MuiButton: { disableElevation: true } },
	zIndex: { dropFiles: 1350 },
};

export { theme };

export default createMuiTheme(theme);
