import { createMuiTheme } from '@material-ui/core/styles';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { CardHeader } from '@material-ui/core';
import React from 'react';

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
        background: { backdrop: '#dadada' },
    },
    shape: {
        borderRadius: 4,
        borderRadiusBold: 8,
    },
    typography: {
        fontFamily: localStorage.getItem('app_use_system_font') === 'true'
            ? 'system-ui'
            : 'Roboto, "Open Sans", sans-serif',
        primaryFontFamily: '"Manrope", "Open Sans", sans-serif',
        // h5: { fontWeight: 700 },
        // h6: { fontWeight: 700 },
    },
    overrides: {
        MuiButton: {
            label: {
                fontWeight: 800,
                fontFamily: '"Manrope", "Open Sans", sans-serif',
                wordBreak: 'break-word',
            },
        },
        MuiTypography: {
            gutterBottom: { marginBottom: '0.8em' },
            h6: {
                fontWeight: 800,
                fontFamily: '"Manrope", "Open Sans", sans-serif',
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
        MuiCardHeader: { titleTypographyProps: { variant: 'h6' } },
    },
    props: { MuiButton: { disableElevation: true } },
    zIndex: { dropFiles: 1350 },
};

export { theme };

export default createMuiTheme({}, theme);
