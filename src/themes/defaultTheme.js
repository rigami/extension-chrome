import { createTheme, alpha } from '@material-ui/core/styles';

const primaryFontFamily = '"Manrope", "Open Sans", sans-serif';
const secondaryFontFamily = 'Inter, sans-serif'; // 'Roboto, "Open Sans", sans-serif';

const baseThemeValues = {
    palette: {
        type: 'light',
        primary: {
            light: '#28DEC8',
            main: '#49C5B6',
            dark: '#299286',
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
        divider: alpha('#000', 0.13),
        dividerLight: alpha('#000', 0.09),
        favorite: { main: '#F4C620' },
        snackbar: { default: alpha('#fff', 0.95) },
        background: {
            backdrop: '#ececec',
            backdropLight: '#F9F9F9',
        },
        text: { primary: alpha('#000', 0.76) },
    },
    shape: {
        borderRadius: 4,
        borderRadiusButton: 6,
        borderRadiusBold: 8,
        dataCard: {
            width: 210,
            height: 86,
        },
    },
    typography: {
        fontFamily: primaryFontFamily,
        primaryFontFamily,
        secondaryFontFamily,
        h1: {
            fontFamily: primaryFontFamily,
            fontWeight: 900,
            letterSpacing: 'unset',
        },
        h2: {
            fontFamily: primaryFontFamily,
            fontWeight: 900,
            letterSpacing: 'unset',
        },
        h6: {
            fontFamily: primaryFontFamily,
            fontSize: '1.125rem',
            letterSpacing: 'unset',
        },
        body1: {
            fontFamily: primaryFontFamily,
            fontWeight: 600,
            letterSpacing: 'unset',
        },
        body2: {
            fontFamily: primaryFontFamily,
            fontWeight: 450,
            fontSize: '0.85rem',
            letterSpacing: 'unset',
        },
    },
    transitions: {
        easing: { shiftEaseInOut: 'cubic-bezier(0.1, 0.84, 0.2, 1)' },
        duration: {
            shortest: 75,
            leavingScreen: 100,
            shorter: 120,
            enteringScreen: 175,
            short: 200,
            standard: 250,
            complex: 300,
            long: 550,
        },
    },
    zIndex: { dropFiles: 1350 },
    shadows: [
        'none',
        '0px 2px 1px -1px rgba(0,0,0,0.08),0px 1px 1px 0px rgba(0,0,0,0.04),0px 1px 3px 0px rgba(0,0,0,0.02)',
        '0px 3px 1px -2px rgba(0,0,0,0.08),0px 2px 2px 0px rgba(0,0,0,0.04),0px 1px 5px 0px rgba(0,0,0,0.02)',
        '0px 3px 3px -2px rgba(0,0,0,0.08),0px 3px 4px 0px rgba(0,0,0,0.04),0px 1px 8px 0px rgba(0,0,0,0.02)',
        '0px 2px 4px -1px rgba(0,0,0,0.08),0px 4px 5px 0px rgba(0,0,0,0.04),0px 1px 10px 0px rgba(0,0,0,0.02)',
        '0px 3px 5px -1px rgba(0,0,0,0.08),0px 5px 8px 0px rgba(0,0,0,0.04),0px 1px 14px 0px rgba(0,0,0,0.02)',
        '0px 3px 5px -1px rgba(0,0,0,0.08),0px 6px 10px 0px rgba(0,0,0,0.04),0px 1px 18px 0px rgba(0,0,0,0.02)',
        '0px 4px 5px -2px rgba(0,0,0,0.08),0px 7px 10px 1px rgba(0,0,0,0.04),0px 2px 16px 1px rgba(0,0,0,0.02)',
        '0px 5px 5px -3px rgba(0,0,0,0.08),0px 8px 10px 1px rgba(0,0,0,0.04),0px 3px 14px 2px rgba(0,0,0,0.02)',
        '0px 5px 6px -3px rgba(0,0,0,0.08),0px 9px 12px 1px rgba(0,0,0,0.04),0px 3px 16px 2px rgba(0,0,0,0.02)',
        '0px 6px 6px -3px rgba(0,0,0,0.08),0px 10px 14px 1px rgba(0,0,0,0.04),0px 4px 18px 3px rgba(0,0,0,0.02)',
        '0px 6px 7px -4px rgba(0,0,0,0.08),0px 11px 15px 1px rgba(0,0,0,0.04),0px 4px 20px 3px rgba(0,0,0,0.02)',
        '0px 7px 8px -4px rgba(0,0,0,0.08),0px 12px 17px 2px rgba(0,0,0,0.04),0px 5px 22px 4px rgba(0,0,0,0.02)',
        '0px 7px 8px -4px rgba(0,0,0,0.08),0px 13px 19px 2px rgba(0,0,0,0.04),0px 5px 24px 4px rgba(0,0,0,0.02)',
        '0px 7px 9px -4px rgba(0,0,0,0.08),0px 14px 21px 2px rgba(0,0,0,0.04),0px 5px 26px 4px rgba(0,0,0,0.02)',
        '0px 8px 9px -5px rgba(0,0,0,0.08),0px 15px 22px 2px rgba(0,0,0,0.04),0px 6px 28px 5px rgba(0,0,0,0.02)',
        '0px 8px 10px -5px rgba(0,0,0,0.08),0px 16px 24px 2px rgba(0,0,0,0.04),0px 6px 30px 5px rgba(0,0,0,0.02)',
        '0px 8px 11px -5px rgba(0,0,0,0.08),0px 17px 26px 2px rgba(0,0,0,0.04),0px 6px 32px 5px rgba(0,0,0,0.02)',
        '0px 9px 11px -5px rgba(0,0,0,0.08),0px 18px 28px 2px rgba(0,0,0,0.04),0px 7px 34px 6px rgba(0,0,0,0.02)',
        '0px 9px 12px -6px rgba(0,0,0,0.08),0px 19px 29px 2px rgba(0,0,0,0.04),0px 7px 36px 6px rgba(0,0,0,0.02)',
        '0px 10px 13px -6px rgba(0,0,0,0.08),0px 20px 31px 3px rgba(0,0,0,0.04),0px 8px 38px 7px rgba(0,0,0,0.02)',
        '0px 10px 13px -6px rgba(0,0,0,0.08),0px 21px 33px 3px rgba(0,0,0,0.04),0px 8px 40px 7px rgba(0,0,0,0.02)',
        '0px 10px 14px -6px rgba(0,0,0,0.08),0px 22px 35px 3px rgba(0,0,0,0.04),0px 8px 42px 7px rgba(0,0,0,0.02)',
        '0px 11px 14px -7px rgba(0,0,0,0.08),0px 23px 36px 3px rgba(0,0,0,0.04),0px 9px 44px 8px rgba(0,0,0,0.02)',
        '0px 11px 15px -7px rgba(0,0,0,0.08),0px 24px 38px 3px rgba(0,0,0,0.04),0px 9px 46px 8px rgba(0,0,0,0.02)',
    ],
};

const baseTheme = createTheme(baseThemeValues);

const theme = {
    ...baseThemeValues,
    overrides: {
        MuiButton: {
            root: { fontWeight: 800 },
            label: {
                fontWeight: 'inherit',
                fontFamily: primaryFontFamily,
                wordBreak: 'break-word',
                textTransform: 'none',
            },
        },
        MuiTab: {
            root: {
                textTransform: 'none',
                fontWeight: 800,
                fontFamily: primaryFontFamily,
                zIndex: 1,
                borderRadius: baseTheme.shape.borderRadius,
                transition: baseTheme.transitions.create(['color'], {
                    duration: baseTheme.transitions.duration.standard,
                    easing: baseTheme.transitions.easing.easeInOut,
                }),
                '&.Mui-selected': { color: baseTheme.palette.common.white },
            },
            labelIcon: {
                minHeight: baseTheme.spacing(6),
                paddingTop: baseTheme.spacing(0.75),
                '& .MuiTab-wrapper > *:first-child': { marginBottom: 0 },
            },
            wrapper: {
                flexDirection: 'initial',
                '& .MuiSvgIcon-root': {
                    marginRight: baseTheme.spacing(0.75),
                    marginBottom: 0,
                },
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
                backgroundColor: alpha('#000', 0.82),
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
        MuiTabs: {
            root: {
                padding: baseTheme.spacing(0.5),
                borderRadius: baseTheme.shape.borderRadius,
                backgroundColor: baseTheme.palette.background.backdrop,
            },
            indicator: {
                height: '100%',
                borderRadius: baseTheme.shape.borderRadius,
            },
        },
    },
    props: {
        MuiButton: { disableElevation: true },
        // MuiCardHeader: { titleTypographyProps: { variant: 'h6' } },
    },
};

export { theme };

export default createTheme({}, theme);
