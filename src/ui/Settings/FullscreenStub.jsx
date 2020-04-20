import React, { useState, useRef } from "preact/compat";
import { h, Component, render, Fragment } from "preact";
import { Typography, Box } from "@material-ui/core";

import PageHeader from "ui/Menu/PageHeader";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    description: {
        textAlign: 'center',
        marginTop: 30,
        color: '#00000066',
        width: 520,
    }
}));


function InWork({ message }) {
    const classes = useStyles();

    return (
        <Box className={classes.root}>
            <Typography variant="h6">{message}</Typography>
        </Box>
    );
}

export default InWork;