import { createTheme, alpha } from '@material-ui/core/styles';
import themeOverrides from '@/themes/themeOverrides';

const specialFontFamily = 'Manrope, "Open Sans", sans-serif';
const fontFamily = 'Inter, sans-serif';

const baseThemeValues = {
    palette: {
        type: 'light',
        primary: {
            light: alpha('#23CFA6', 0.2),
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
            contrast: '#fd9b58',
            contrastText: alpha('#000', 0.76),
        },
        info: {
            main: '#d5ebfd',
            contrast: '#6cb6f3',
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
            width: 200,
            height: 76,
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

export { baseThemeValues as themeValuesRaw, baseTheme as themeValues };

export default createTheme({}, {
    ...baseTheme,
    ...themeOverrides(baseTheme),
});
