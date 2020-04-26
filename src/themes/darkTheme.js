import {createMuiTheme} from '@material-ui/core/styles';
import {theme} from "./defaultTheme";
import {fade} from '@material-ui/core/styles/colorManipulator';
import merge from "utils/mergeObjects";

export default createMuiTheme(merge(
    theme,
    {
        palette: {
            type: "dark",
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
            },
            background: {
                paper: "#151515",
            },
        },
        overrides: {
            MuiPaper: {
                root: {
                    color: "#d7d7d7",
                },
            },
            MuiAvatar: {
                colorDefault: {
                    color: "#151515",
                },
            },
            MuiTooltip: {
                tooltip: {
                    backgroundColor: fade('#000', 0.82),
                }
            },
            MuiSwitch: {
                switchBase: {
                    color: "#3f3f3f",
                },
            },
            MuiTypography: {
                colorTextSecondary: {
                    color: fade("#fff", 0.53),
                },
            },
        },
    }
));