import React, { useState, useRef } from "preact/compat";
import { h, Component, render, Fragment } from "preact";

import { ListItem, ListItemAvatar, ListItemText } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
    root: {
        paddingTop: theme.spacing(2),
    },
    title: {
        fontSize: '22px',
        fontWeight: 800,
    }
}));

function SectionHeader({ title }) {
    const classes = useStyles();

    return (
        <ListItem className={classes.root}>
            <ListItemAvatar />
            <ListItemText classes={{ primary: classes.title }} primary={title} />
        </ListItem>
    );
}

export default SectionHeader;