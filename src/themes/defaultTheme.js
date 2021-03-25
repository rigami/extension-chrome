import { createMuiTheme } from '@material-ui/core/styles';
import { fade } from '@material-ui/core/styles/colorManipulator';

const primaryFontFamily = '"Manrope", "Open Sans", sans-serif';
const secondaryFontFamily = 'Roboto, "Open Sans", sans-serif';

const theme = {
    palette: {
        type: 'light',
        primary: {
            main: '#49C5B6',
            contrastText: '#fff',
        },
        secondary: {
            main: '#3386E4',
            contrastText: '#fff',
        },
        warning: {
            main: '#f46600',
            contrastText: '#fff',
        },
        snackbar: { default: fade('#fff', 0.95) },
        background: { backdrop: '#ececec' },
    },
    shape: {
        borderRadius: 4,
        borderRadiusBold: 8,
    },
    typography: {
        fontFamily: secondaryFontFamily,
        primaryFontFamily,
        secondaryFontFamily,
    },
    overrides: {
        MuiButton: {
            label: {
                fontWeight: 800,
                fontFamily: primaryFontFamily,
                wordBreak: 'break-word',
            },
        },
        MuiTypography: {
            gutterBottom: { marginBottom: '0.8em' },
            h6: {
                fontWeight: 800,
                fontFamily: primaryFontFamily,
            },
        },
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
        MuiCardHeader: {
            title: {
                fontFamily: primaryFontFamily,
                fontWeight: 600,
            },
        },
    },
    props: {
        MuiButton: { disableElevation: true },
        // MuiCardHeader: { titleTypographyProps: { variant: 'h6' } },
    },
    zIndex: { dropFiles: 1350 },
};

export { theme };

export default createMuiTheme({}, theme);
