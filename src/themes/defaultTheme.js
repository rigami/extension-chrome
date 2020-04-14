import {createMuiTheme} from '@material-ui/core/styles';
import {fade} from '@material-ui/core/styles/colorManipulator';

export default createMuiTheme({
    palette: {
        type: "light",
        primary: {
            main: "#2675F0",
            contrastText: "#fff",
        },
        secondary: {
            main: "#8526D0",
            contrastText: "#fff",
        },
        snackbar: {
            default: fade("#fff", 0.95),
        }
    },
    typography: {
        h5: {
            fontWeight: 600,
        },
    },
    overrides: {
        MuiButton: {
            label: {
                fontWeight: 600,
            },
        },
        MuiTypography: {
            gutterBottom: {
                marginBottom: '0.8em',
            }
        },
        MuiTooltip: {
            tooltip: {
                backgroundColor: fade('#000', 0.82),
                fontSize: '0.8rem',
            }
        },
    },
    props: {
        MuiButton: {
            disableElevation: true,
        },
    },
});