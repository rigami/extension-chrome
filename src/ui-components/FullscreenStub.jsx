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
    icon: { fontSize: '56px' },
    title: {
        color: theme.palette.text.primary,
        wordBreak: 'break-word',
        textAlign: 'center',
        fontWeight: 800,
        fontFamily: theme.typography.primaryFontFamily,
    },
    description: {
        color: theme.palette.text.secondary,
        wordBreak: 'break-word',
        textAlign: 'center',
        fontWeight: 800,
        fontFamily: theme.typography.primaryFontFamily,
    },
    bottomOffset: { marginBottom: theme.spacing(2) },
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
        classes: externalClasses = {},
        ...other
    } = props;
    const classes = useStyles();

    const Icon = icon;

    return (
        <Box className={clsx(classes.root, externalClassName)} {...other}>
            <Container className={classes.container} maxWidth="md">
                {icon && (
                    <Icon
                        {...iconProps}
                        className={clsx(classes.icon, iconProps.className, classes.bottomOffset)}
                    />
                )}
                {message && (
                    <Typography
                        variant="h6"
                        className={clsx(
                            classes.title,
                            !description && classes.bottomOffset,
                            externalClasses.title,
                        )}
                    >
                        {message}
                    </Typography>
                )}
                {description && (
                    <Typography
                        variant="body1"
                        className={clsx(
                            classes.description,
                            (children || actions) && actions?.length > 0 && classes.bottomOffset,
                            externalClasses.description,
                        )}
                    >
                        {description}
                    </Typography>
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
