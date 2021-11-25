import React, { forwardRef } from 'react';
import {
    ButtonBase,
    Card,
    Tooltip,
} from '@material-ui/core';
import clsx from 'clsx';
import { makeStyles, alpha } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    card: {
        borderRadius: theme.shape.borderRadiusButton,
        display: 'flex',
        flexDirection: 'column',
    },
    button: {
        borderRadius: theme.shape.borderRadiusButton,
        padding: theme.spacing(1 - 0.125),
        '& svg + $label': {
            marginLeft: theme.spacing(1),
            fontSize: '0.9rem',
            fontFamily: theme.typography.primaryFontFamily,
            fontWeight: 600,
            marginRight: theme.spacing(0.5),
        },
        '& svg': {
            width: 22,
            height: 22,
        },
        '&:hover': { backgroundColor: theme.palette.action.hover },
    },
    label: {},
    blurBackdrop: {
        backdropFilter: 'blur(10px) brightness(200%)',
        backgroundColor: alpha(theme.palette.background.backdrop, 0.52),
    },
    default: {},
    outline: { boxShadow: `inset 0px 0px 0px 1px ${theme.palette.divider}` },
}));

function ExtendButtonGroup({ children, variant = 'default', className: externalClassName, ...other }, ref) {
    const classes = useStyles();

    return (
        <Card
            ref={ref}
            className={clsx(classes.card, classes[variant], externalClassName)}
            elevation={0}
            {...other}
        >
            {children}
        </Card>
    );
}

function ExtendButton(props) {
    const {
        tooltip,
        icon,
        label,
        className: externalClassName,
        ...other
    } = props;
    const classes = useStyles();

    const Icon = icon;

    return (
        <Tooltip title={tooltip} placement="bottom">
            <ButtonBase
                size="small"
                className={clsx(classes.button, externalClassName)}
                {...other}
                data-ui-path={`fab.${other['data-ui-path']}`}
            >
                <Icon />
                {label && (
                    <span className={classes.label}>{label}</span>
                )}
            </ButtonBase>
        </Tooltip>
    );
}

const ForwardRefExtendButtonGroup = forwardRef(ExtendButtonGroup);

export { ForwardRefExtendButtonGroup as ExtendButtonGroup, ExtendButton };
