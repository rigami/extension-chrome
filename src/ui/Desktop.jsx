import React, { useState } from "preact/compat";
import { h, Component, render, Fragment } from "preact";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
    root: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#000",
    },
}));

function Desktop() {
    const classes = useStyles();

    return (
        <div className={classes.root}>

        </div>
    );
}

export default Desktop;