import React, { forwardRef } from 'react';
import {
    ButtonBase,
    Card,
    Tooltip,
} from '@material-ui/core';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import { fade } from '@material-ui/core/styles/colorManipulator';

const useStyles = makeStyles((theme) => ({
    card: {
        borderRadius: theme.shape.borderRadius,
        backdropFilter: 'blur(10px) brightness(200%)',
        backgroundColor: fade(theme.palette.background.backdrop, 0.52),
        display: 'flex',
        flexDirection: 'column',
        // marginTop: theme.spacing(2),
    },
    button: {
        padding: theme.spacing(1),
        '& svg + $label': {
            marginLeft: theme.spacing(1),
            fontSize: '0.9rem',
            fontFamily: theme.typography.primaryFontFamily,
            fontWeight: 600,
            marginRight: theme.spacing(0.5),
        },
    },
    label: {},
}));

function ExtendButtonGroup({ children, className: externalClassName, ...other }, ref) {
    const classes = useStyles();

    return (
        <Card
            ref={ref}
            className={clsx(classes.card, externalClassName)}
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
