import React from "preact/compat";
import {h, Component, render, Fragment} from "preact";
import {makeStyles} from "@material-ui/core/styles";
import {
    Typography,
    Box,
    Button,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
    },
    icon: {
        fontSize: '56px',
        marginBottom: theme.spacing(1),
    },
    description: {
        color: theme.palette.text.secondary,
    }
}));


function InWork({iconRender, message, description, actions, children, ...other}) {
    const classes = useStyles();

    return (
        <Box className={classes.root} {...other}>
            {iconRender && iconRender({className: classes.icon})}
            {message && (
                <Typography variant="h6">{message}</Typography>
            )}
            {description && (
                <Typography variant="body1" className={classes.description} gutterBottom>{description}</Typography>
            )}
            {children}
            {actions && actions.map(({title, ...props}) => (
                <Button {...props}>{title}</Button>
            ))}
        </Box>
    );
}

export default InWork;