import React, {useState, useRef} from "preact/compat";
import {h, Component, render, Fragment} from "preact";
import {fade} from '@material-ui/core/styles/colorManipulator';

import {
    IconButton,
    AppBar,
    Toolbar,
    Typography
} from "@material-ui/core";
import {ArrowBackRounded as BackIcon} from "@material-ui/icons";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
    root: {
        backgroundColor: fade(theme.palette.common.white, 0.8),
    },
    toolbar: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
    },
    backButton: {
        padding: theme.spacing(1),
        marginRight: theme.spacing(2),
        color: "#000",
    },
    title: {
        fontSize: '22px',
        fontWeight: 800,
    },
    actions: {
        marginLeft: theme.spacing(4),
        display: 'flex',
        flexDirection: 'row',
    },
    grow: {
        flexGrow: 1,
    },
}));

function PageHeader({title, onBack, actions}) {
    const classes = useStyles();

    return (
        <AppBar position="sticky" color="transparent" elevation={0} className={classes.root}>
            <Toolbar className={classes.toolbar}>
                <IconButton
                    className={classes.backButton}
                    onClick={() => onBack()}
                >
                    <BackIcon/>
                </IconButton>
                <Typography className={classes.title} variant="h6" noWrap>{title}</Typography>
                <div className={classes.actions}>
                    {actions}
                </div>
                <div className={classes.grow}/>
            </Toolbar>
        </AppBar>
    );
}

export default PageHeader;