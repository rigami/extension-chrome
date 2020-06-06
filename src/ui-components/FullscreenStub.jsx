import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
    Typography,
    Box,
    Button,
} from '@material-ui/core';

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
    title: { color: theme.palette.text.primary },
    description: { color: theme.palette.text.secondary },
}));


function FullScreenStub(props) {
    const {
        iconRender,
        message,
        description,
        actions,
        children,
        ...other
    } = props;
    const classes = useStyles();

    return (
        <Box className={classes.root} {...other}>
            {iconRender && iconRender({ className: classes.icon })}
            {message && (
                <Typography variant="h6" className={classes.title}>{message}</Typography>
            )}
            {description && (
                <Typography variant="body1" className={classes.description} gutterBottom>{description}</Typography>
            )}
            {children}
            {actions && actions.map(({ title, ...actionProps }) => (
                <Button {...actionProps} key={title}>{title}</Button>
            ))}
        </Box>
    );
}

export default FullScreenStub;
