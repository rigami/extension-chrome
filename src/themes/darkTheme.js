import { createMuiTheme } from '@material-ui/core/styles';
import { fade } from '@material-ui/core/styles/colorManipulator';
import merge from '@/utils/mergeObjects';
import { theme } from './defaultTheme';

export default createMuiTheme(merge(
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
            divider: fade('#fff', 0.09),
            snackbar: { default: fade('#fff', 0.95) },
            background: {
                paper: '#151515',
                backdrop: '#1d1d1d',
            },
        },
        overrides: {
            MuiPaper: { root: { color: '#d7d7d7' } },
            MuiAvatar: { colorDefault: { color: '#151515' } },
            MuiTooltip: { tooltip: { backgroundColor: fade('#000', 0.82) } },
            MuiSwitch: { switchBase: { color: '#3f3f3f' } },
            MuiTypography: { colorTextSecondary: { color: fade('#fff', 0.53) } },
        },
    },
));
