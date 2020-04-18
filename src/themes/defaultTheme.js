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
        fontFamily: "system-ui",
        h5: {
            fontWeight: 700,
        },
        h6: {
            fontWeight: 700,
        },
    },
    overrides: {
        MuiButton: {
            label: {
                fontWeight: 700,
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