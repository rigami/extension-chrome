import React from "preact/compat";
import { h, Component, render, Fragment } from "preact";
import { CssBaseline } from "@material-ui/core";

import Menu from "./Menu";
import Desktop from "./Desktop";
import {ThemeProvider} from "@material-ui/styles";
import theme from "../themes/defaultTheme"


function App() {

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Desktop />
            <Menu />
        </ThemeProvider>
    );
}

render(<App/>, document.body);