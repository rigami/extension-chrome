import React, { useState, useRef } from "preact/compat";
import { h, Component, render, Fragment } from "preact";
import { Typography } from "@material-ui/core";

import PageHeader from "ui/Menu/PageHeader";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    description: {
        textAlign: 'center',
        marginTop: 30,
        color: '#00000066',
        width: 520,
    }
}));


function InWork({ title, onClose }) {
    const classes = useStyles();

    return (
        <Fragment>
            <PageHeader title={title} onBack={() => onClose()} />
            <Typography className={classes.description}>Эта страница в разработке</Typography>
        </Fragment>
    );
}

export default InWork;