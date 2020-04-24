import React from "preact/compat";
import { h, Component, render, Fragment } from "preact";
import { CssBaseline } from "@material-ui/core";
import { Provider } from 'mobx-react';
import { SnackbarProvider } from 'notistack';

import Menu from "./Menu";
import Desktop from "./Desktop";
import {ThemeProvider} from "@material-ui/styles";
import theme from "themes/defaultTheme"
import Snackbar from "ui-components/Snackbar";
import UploadBGForm from "ui-components/UploadBGForm";
import ConfigurationApp from "hoc/ConfigurationApp";

function App() {

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <ConfigurationApp>
                {(stores) => (
                    <Provider {...stores}>
                        <SnackbarProvider
                            maxSnack={4}
                            content={(key, options) => (
                                <Snackbar id={key} {...options} />
                            )}
                        >
                            <UploadBGForm>
                                <Desktop />
                                <Menu />
                            </UploadBGForm>
                        </SnackbarProvider>
                    </Provider>
                )}
            </ConfigurationApp>
        </ThemeProvider>
    );
}

render(<App/>, document.body);