import { createTheme, alpha } from '@material-ui/core/styles';
import merge from '@/utils/mergeObjects';
import { theme } from './defaultTheme';

export default createTheme(merge(
    theme,
    {
        palette: {
            type: 'dark',
            primary: {
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
            },
        },
        overrides: {
            MuiPaper: { root: { color: '#d7d7d7' } },
            MuiAvatar: { colorDefault: { color: '#151515' } },
            MuiTooltip: { tooltip: { backgroundColor: alpha('#000', 0.82) } },
            MuiSwitch: { switchBase: { color: '#3f3f3f' } },
            MuiTypography: { colorTextSecondary: { color: alpha('#fff', 0.53) } },
        },
    },
));
