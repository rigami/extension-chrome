import { h, Component, render, Fragment } from "preact";
import { Button, CssBaseline  } from "@material-ui/core";
import React from "preact/compat";

function App() {
    return (
        <Fragment>
            <CssBaseline />
            <Button variant="contained" color="primary">
                start page
            </Button>
        </Fragment>
    );
}

render(<App/>, document.body);