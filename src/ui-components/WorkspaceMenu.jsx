import React from "preact/compat";
import { h, Component, render, Fragment } from "preact";
import { Card, IconButton, Divider } from "@material-ui/core";
import { Refresh as RefreshIcon, Settings as SettingsIcon } from "@material-ui/icons";
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
    root: {
        position: 'absolute',
        borderRadius: theme.spacing(3),
        padding: theme.spacing(.5),
        bottom: theme.spacing(3),
        right: theme.spacing(3),
    },
    divider: {
        marginTop: theme.spacing(.5),
        marginBottom: theme.spacing(.5),
    }
}));

function WorkspaceMenu({ onMenu }) {
    const classes = useStyles();

    return (
        <Card className={classes.root} elevation={6}>
            <IconButton size='small' onClick={() => onMenu()}>
                <SettingsIcon />
            </IconButton>
            <Divider className={classes.divider}/>
            <IconButton size='small' disabled>
                <RefreshIcon />
            </IconButton>
        </Card>
    );
}

export default WorkspaceMenu;