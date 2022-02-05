import React from 'react';
import {
    ListItem,
    ListItemIcon,
    ListItemText,
    Collapse,
    Box,
    CardActions,
} from '@material-ui/core';
import {
    InfoRounded as InfoIcon,
    WarningRounded as WarnIcon,
    ErrorRounded as ErrorIcon,
} from '@material-ui/icons';
import { makeStyles, alpha } from '@material-ui/core/styles';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
    collapse: { width: '100%' },
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        borderRadius: theme.shape.borderRadiusBolder,
    },
    info: {
        backgroundColor: theme.palette.info.main,
        '& $icon': { color: theme.palette.info.contrastText },
        '& $messageText': { color: theme.palette.info.contrastText },
        '& $descriptionText': { color: alpha(theme.palette.info.contrastText, 0.8) },
        '& $actions': { color: theme.palette.info.contrastText },
        '& $toolbarActions': { color: theme.palette.info.contrastText },
    },
    warn: {
        backgroundColor: theme.palette.warning.main,
        '& $icon': { color: theme.palette.warning.contrastText },
        '& $messageText': { color: theme.palette.warning.contrastText },
        '& $descriptionText': { color: alpha(theme.palette.warning.contrastText, 0.6) },
        '& $actions': { color: theme.palette.warning.contrastText },
        '& $toolbarActions': { color: theme.palette.warning.contrastText },
    },
    error: {
        backgroundColor: theme.palette.error.main,
        '& $icon': { color: theme.palette.error.contrastText },
        '& $messageText': { color: theme.palette.error.contrastText },
        '& $descriptionText': { color: alpha(theme.palette.error.contrastText, 0.8) },
        '& $actions': { color: theme.palette.error.contrastText },
        '& $toolbarActions': { color: theme.palette.error.contrastText },
    },
    icon: {},
    messageText: {},
    descriptionText: {},
    actions: {
        marginLeft: theme.spacing(2),
        '& > *': { color: 'inherit' },
    },
    iconWrapper: {
        minWidth: theme.spacing(7),
        paddingLeft: theme.spacing(1),
        alignSelf: 'baseline',
        marginTop: theme.spacing(0.75),
        marginBottom: theme.spacing(0.75),
    },
    toolbarActions: {
        justifyContent: 'flex-end',
        '& > *': { color: 'inherit' },
    },
}));

function MenuInfo(props) {
    const {
        component = 'li',
        show,
        message,
        description,
        width,
        variant = 'info',
        icon,
        classes: externalClasses = {},
        actions,
        toolbarActions,
    } = props;
    const classes = useStyles();

    let Icon;

    if (variant === 'info') {
        Icon = InfoIcon;
    } else if (variant === 'warn') {
        Icon = WarnIcon;
    } else if (variant === 'error') {
        Icon = ErrorIcon;
    }

    if (icon) {
        Icon = icon;
    }

    return (
        <Collapse in={show} className={clsx(classes.collapse, externalClasses.wrapper)}>
            <ListItem
                ContainerComponent={component}
                className={clsx(
                    classes.root,
                    variant === 'info' && classes.info,
                    variant === 'warn' && classes.warn,
                    variant === 'error' && classes.error,
                    externalClasses.root,
                )}
                style={{ width }}
            >
                <Box display="flex" flexDirection="row">
                    {Icon && (
                        <ListItemIcon className={classes.iconWrapper}>
                            <Icon className={classes.icon} />
                        </ListItemIcon>
                    )}
                    <ListItemText
                        classes={{
                            primary: classes.messageText,
                            secondary: classes.descriptionText,
                        }}
                        primary={message}
                        secondary={description}
                    />
                    {actions && (
                        <Box className={classes.actions}>
                            {actions}
                        </Box>
                    )}
                </Box>
                {toolbarActions && (
                    <CardActions className={classes.toolbarActions}>
                        {toolbarActions}
                    </CardActions>
                )}
            </ListItem>
        </Collapse>
    );
}

export default MenuInfo;
