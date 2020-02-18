import React, { useState } from "preact/compat";
import { h, Component, render, Fragment } from "preact";
import { Button, CssBaseline  } from "@material-ui/core";

import Workspace from "./Workspace";
import WorkspaceMenu from "../ui-components/WorkspaceMenu";
import Menu from "../ui-components/Menu";

function App() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Fragment>
            <CssBaseline />
            <Workspace>

            </Workspace>
            <WorkspaceMenu onMenu={() => setIsOpen(true)}/>
            <Menu isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </Fragment>
    );
}

render(<App/>, document.body);