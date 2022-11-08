import { createTheme, alpha } from '@material-ui/core/styles';
import merge from '@/utils/mergeObjects';
import { themeValuesRaw as defaultThemeValues } from './defaultTheme';
import themeOverrides from '@/themes/themeOverrides';

const baseThemeValues = merge(
    defaultThemeValues,
    {
        palette: {
            type: 'dark',
            primary: {
                light: alpha('#23CFA6', 0.2),
                main: '#49C5B6',
                contrastText: '#fff',
            },
            secondary: {
                main: '#3386E4',
                contrastText: '#fff',
            },
            divider: alpha('#fff', 0.09),
            snackbar: { default: alpha('#fff', 0.95) },
            background: {
                paper: '#151515',
                backdrop: '#1d1d1d',
                default: '#161616',
                backdropLight: '#181818',
            },
            text: {
                primary: alpha('#fff', 0.76),
                secondary: alpha('#fff', 0.5),
            },
        },
    },
);

const baseTheme = createTheme(baseThemeValues);

export { baseThemeValues as themeValuesRaw, baseTheme as themeValues };

export default createTheme({}, {
    ...baseTheme,
    ...themeOverrides(baseTheme),
});
