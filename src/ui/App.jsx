import React from "preact/compat";
import { h, Component, render, Fragment } from "preact";
import { CssBaseline } from "@material-ui/core";
import { Provider } from 'mobx-react';
import { SnackbarProvider } from 'notistack';

import Menu from "./Menu";
import Desktop from "./Desktop";
import {ThemeProvider} from "@material-ui/styles";
import theme from "../themes/defaultTheme"

import backgroundsStore from "stores/backgrounds";

const stores = { backgroundsStore };

function App() {

    return (
        <Provider {...stores}>
            <ThemeProvider theme={theme}>
                <SnackbarProvider maxSnack={4}>
                    <CssBaseline />
                    <Desktop />
                    <Menu />
                </SnackbarProvider>
            </ThemeProvider>
        </Provider>
    );
}

render(<App/>, document.body);