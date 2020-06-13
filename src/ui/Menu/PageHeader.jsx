import React, { memo } from 'react';
import {
    IconButton,
    AppBar,
    Toolbar,
    Typography,
} from '@material-ui/core';
import { ArrowBackRounded as BackIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { fade } from '@material-ui/core/styles/colorManipulator';

const useStyles = makeStyles((theme) => ({
    root: { backgroundColor: fade(theme.palette.background.paper, 0.8) },
    toolbar: {
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
    },
    backButton: {
        padding: theme.spacing(1),
        marginRight: theme.spacing(2),
        color: theme.palette.getContrastText(theme.palette.background.paper),
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
    grow: { flexGrow: 1 },
}));

function PageHeader({ title, onBack, actions, ...other }) {
    const classes = useStyles();

    console.log('RENDER SECTION');

    return (
        <AppBar
            position="sticky" color="transparent" elevation={0}
            className={classes.root} {...other}
        >
            <Toolbar className={classes.toolbar}>
                <IconButton
                    className={classes.backButton}
                    onClick={() => onBack()}
                >
                    <BackIcon />
                </IconButton>
                <Typography className={classes.title} variant="h6" noWrap>{title}</Typography>
                <div className={classes.actions}>
                    {actions}
                </div>
                <div className={classes.grow} />
            </Toolbar>
        </AppBar>
    );
}

export default memo(PageHeader);
