import React from "preact/compat";
import { h, Component, render, Fragment } from "preact";
import { CssBaseline } from "@material-ui/core";

import Menu from "../ui-components/Menu";
import Desktop from "../ui-components/Desktop";


function App() {

    return (
        <Fragment>
            <CssBaseline />
            <Desktop />
            <Menu />
        </Fragment>
    );
}

render(<App/>, document.body);