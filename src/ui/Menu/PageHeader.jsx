import React, { useState, useRef } from "preact/compat";
import { h, Component, render, Fragment } from "preact";

import {IconButton, ListItem, ListItemIcon, ListItemText} from "@material-ui/core";
import {ArrowBackRounded as BackIcon} from "@material-ui/icons";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
    root: {
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
    },
    backButton: {
        padding: theme.spacing(1),
        color: "#000",
    },
    title: {
        fontSize: '22px',
        fontWeight: 800,
    }
}));

function PageHeader({ title, onBack }) {
    const classes = useStyles();

    return (
        <ListItem className={classes.root}>
            <ListItemIcon>
                <IconButton className={classes.backButton} onClick={() => onBack()}>
                    <BackIcon />
                </IconButton>
            </ListItemIcon>
            <ListItemText classes={{ primary: classes.title }} primary={title} />
        </ListItem>
    );
}

export default PageHeader;