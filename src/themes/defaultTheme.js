import {createMuiTheme} from '@material-ui/core/styles';

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
    },
    props: {
        MuiButton: {
            disableElevation: true,
        },
    },
});