import React from "preact/compat";
import { h, Component, render, Fragment } from "preact";
import { CssBaseline } from "@material-ui/core";

import Menu from "./Menu";
import Desktop from "./Desktop";


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