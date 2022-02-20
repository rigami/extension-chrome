import { createTheme, alpha } from '@material-ui/core/styles';

const specialFontFamily = 'Manrope, "Open Sans", sans-serif';
const fontFamily = 'Inter, sans-serif';

const baseThemeValues = {
    palette: {
        type: 'light',
        primary: {
            light: '#DEF8F2',
            main: '#23CFA6',
            dark: '#12AB86',
            contrastText: '#fff',
        },
        secondary: {
            main: '#23CFA6',
            contrastText: '#fff',
        },
        warning: {
            main: '#ffe4d1',
            contrastText: alpha('#000', 0.76),
        },
        info: {
            main: '#d5ebfd',
            contrastText: alpha('#000', 0.7),
        },
        divider: alpha('#000', 0.13),
        dividerLight: alpha('#000', 0.09),
        favorite: { main: '#F4C620' },
        snackbar: { default: alpha('#fff', 0.95) },
        background: {
            backdrop: '#ececec',
            backdropLight: '#F9F9F9',
            default: '#FFFFFF',
        },
        text: { primary: alpha('#000', 0.76) },
    },
    shape: {
        borderRadius: 4,
        borderRadiusButton: 6,
        borderRadiusButtonBold: 8,
        borderRadiusBold: 10,
        borderRadiusBolder: 12,
        dataCard: {
            width: 210,
            height: 82,
        },
    },
    typography: {
        fontFamily,
        specialFontFamily,
        secondaryFontFamily: fontFamily,
        h1: {
            fontFamily: specialFontFamily,
            fontWeight: 900,
            letterSpacing: 'unset',
        },
        h2: {
            fontFamily: specialFontFamily,
            fontWeight: 900,
            letterSpacing: 'unset',
        },
        h3: {
            fontFamily: specialFontFamily,
            fontWeight: 800,
        },
        h4: {
            fontFamily: specialFontFamily,
            fontWeight: 800,
        },
        h5: {
            fontFamily: specialFontFamily,
            fontWeight: 800,
        },
        h6: {
            fontFamily: specialFontFamily,
            fontWeight: 800,
            fontSize: '1.125rem',
            letterSpacing: 'unset',
        },
        body1: {
            fontFamily: specialFontFamily,
            fontWeight: 600,
            letterSpacing: 'unset',
        },
        body2: {
            fontFamily,
            fontWeight: 400,
            fontSize: '0.85rem',
            letterSpacing: 'unset',
        },
        button: { fontFamily: specialFontFamily },
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
        MuiListSubheader: { root: { fontFamily: baseTheme.typography.specialFontFamily } },
        MuiButtonBase: { root: { fontFamily: baseTheme.typography.specialFontFamily } },
        MuiPaper: { rounded: { borderRadius: baseTheme.shape.borderRadiusBolder } },
        MuiButton: {
            root: {
                fontWeight: 800,
                borderRadius: baseTheme.shape.borderRadiusBolder,
                padding: baseTheme.spacing(1, 2),
                boxShadow: 'none',
            },
            text: { padding: baseTheme.spacing(1, 2) },
            label: {
                fontWeight: 'inherit',
                wordBreak: 'break-word',
                textTransform: 'none',
            },
            contained: {
                boxShadow: 'none',
                '&:hover': { boxShadow: 'none' },
                '&:active': { boxShadow: 'none' },
            },
            containedPrimary: {
                color: baseTheme.palette.primary.dark,
                backgroundColor: baseTheme.palette.primary.light,
                '&:hover': {
                    color: baseTheme.palette.common.white,
                    backgroundColor: baseTheme.palette.primary.main,
                    boxShadow: `${alpha(baseTheme.palette.primary.main, 0.4)} 0px 0px 0px 3px`,
                },
            },
        },
        MuiTab: {
            root: {
                textTransform: 'none',
                fontWeight: 800,
                zIndex: 1,
                borderRadius: baseTheme.shape.borderRadiusButtonBold,
                transition: baseTheme.transitions.create(['color'], {
                    duration: baseTheme.transitions.duration.standard,
                    easing: baseTheme.transitions.easing.easeInOut,
                }),
                '&.Mui-selected': { color: baseTheme.palette.primary.dark },
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
        MuiTypography: { gutterBottom: { marginBottom: '0.8em' } },
        MuiTooltip: {
            tooltip: {
                backgroundColor: alpha('#000', 0.82),
                fontSize: '0.85rem',
                padding: '6px 12px',
            },
        },
        MuiSwitch: {
            thumb: { boxShadow: 'none' },
            switchBase: { color: baseTheme.palette.background.paper },
            track: { borderRadius: 13 },
            root: { padding: 6 },
            colorPrimary: {
                '&.Mui-checked': {
                    color: baseTheme.palette.background.paper,
                    '& + .MuiSwitch-track': {
                        backgroundColor: baseTheme.palette.primary.main,
                        opacity: 1,
                    },
                },
            },
        },
        MuiSlider: {
            root: {
                margin: baseTheme.spacing(0, 1),
                height: baseTheme.spacing(1.5),
            },
            rail: {
                marginLeft: baseTheme.spacing(-0.75),
                width: `calc(100% + ${baseTheme.spacing(1.5)}px)`,
                height: baseTheme.spacing(1.5),
                borderRadius: baseTheme.spacing(0.75),
            },
            track: {
                paddingRight: baseTheme.spacing(1.5),
                height: baseTheme.spacing(1.5),
                borderRadius: baseTheme.spacing(0.75),
                marginLeft: baseTheme.spacing(-0.75),
            },
            thumb: {
                width: baseTheme.spacing(1),
                height: baseTheme.spacing(1),
                marginTop: baseTheme.spacing(0.25),
                marginLeft: baseTheme.spacing(-0.5),
                backgroundColor: baseTheme.palette.background.paper,
            },
            valueLabel: { left: `calc(-50% - ${baseTheme.spacing(1)}px)` },
            mark: {
                transform: 'translateX(-50%)',
                height: baseTheme.spacing(1.5),
                opacity: 0.5,
            },
            markActive: { opacity: 0.3 },
        },
        MuiCardHeader: { title: { fontWeight: 600 } },
        MuiTabs: {
            root: {
                padding: baseTheme.spacing(0.5),
                borderRadius: baseTheme.shape.borderRadiusBolder,
                backgroundColor: baseTheme.palette.background.backdrop,
            },
            indicator: {
                height: '100%',
                borderRadius: baseTheme.shape.borderRadiusButtonBold,
                backgroundColor: baseTheme.palette.background.paper,
            },
        },
        MuiFilledInput: {
            root: {
                borderRadius: baseTheme.shape.borderRadiusButtonBold,
                borderTopLeftRadius: baseTheme.shape.borderRadiusButtonBold,
                borderTopRightRadius: baseTheme.shape.borderRadiusButtonBold,
                '&.Mui-focused': { boxShadow: `${alpha(baseTheme.palette.primary.main, 0.4)} 0px 0px 0px 3px` },
            },
            inputMarginDense: {
                paddingTop: baseTheme.spacing(1.25),
                paddingBottom: baseTheme.spacing(1.25),
            },
            underline: {
                '&:before': {
                    borderBottom: 'none',
                    content: '',
                },
                '&:after': {
                    borderBottom: 'none',
                    content: '',
                },
            },
        },
        MuiSelect: { selectMenu: { textAlign: 'center' } },
        MuiInputBase: { root: { fontSize: '0.85rem' } },
    },
    props: {
        // MuiButton: { disableElevation: true },
        // MuiCardHeader: { titleTypographyProps: { variant: 'h6' } },
    },
};

export { theme };

export default createTheme({}, theme);
