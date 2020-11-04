import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
    Typography,
    Box,
    Button,
    Container,
} from '@material-ui/core';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
    },
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        height: '100%',
    },
    icon: {
        fontSize: '56px',
        marginBottom: theme.spacing(1),
    },
    title: {
        color: theme.palette.text.primary,
        wordBreak: 'break-word',
        textAlign: 'center',
    },
    description: {
        color: theme.palette.text.secondary,
        wordBreak: 'break-word',
        textAlign: 'center',
    },
}));

function FullScreenStub(props) {
    const {
        iconRender,
        message,
        description,
        actions,
        children,
        className: externalClassName,
        ...other
    } = props;
    const classes = useStyles();

    return (
        <Box className={clsx(classes.root, externalClassName)} {...other}>
            <Container className={classes.container} maxWidth="md">
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
            </Container>
        </Box>
    );
}

export default FullScreenStub;
