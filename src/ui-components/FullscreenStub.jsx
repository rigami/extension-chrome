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
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
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
        marginBottom: theme.spacing(2),
    },
    content: {
        marginBottom: theme.spacing(2),
    },
}));

function FullScreenStub(props) {
    const {
        icon,
        iconProps = {},
        message,
        description,
        actions,
        children,
        className: externalClassName,
        ...other
    } = props;
    const classes = useStyles();

    const Icon = icon;

    return (
        <Box className={clsx(classes.root, externalClassName)} {...other}>
            <Container className={classes.container} maxWidth="md">
                {icon && (<Icon {...iconProps} className={clsx(classes.icon, iconProps.className)} />)}
                {message && (
                    <Typography variant="h6" className={classes.title}>{message}</Typography>
                )}
                {description && (
                    <Typography variant="body1" className={classes.description} gutterBottom>{description}</Typography>
                )}
                {children && (
                    <Box className={classes.content}>
                        {children}
                    </Box>
                )}
                {actions && actions.map(({ title, ...actionProps }) => (
                    <Button {...actionProps} key={title}>{title}</Button>
                ))}
            </Container>
        </Box>
    );
}

export default FullScreenStub;
