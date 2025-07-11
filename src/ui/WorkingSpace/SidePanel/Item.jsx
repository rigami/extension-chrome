import React, { forwardRef, useRef } from 'react';
import {
    ButtonBase,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Box,
} from '@material-ui/core';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    itemRoot: {
        color: theme.palette.text.secondary,
        padding: 0,
        paddingRight: theme.spacing(0.5),
        position: 'relative',
        fontWeight: 550,
        borderRadius: theme.shape.borderRadiusButton,
        width: '100%',
        height: 30,
    },
    itemContainer: {
        '& $addSubFolder': { opacity: 0 },
        '&:hover $addSubFolder': { opacity: 1 },
    },
    itemInset: { paddingLeft: 22 },
    text: {
        color: theme.palette.text.secondary,
        fontSize: '0.9rem',
        fontWeight: 'inherit',
        fontFamily: theme.typography.specialFontFamily,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        letterSpacing: 'inherit',
    },
    actions: {
        // marginLeft: 'auto',
        flexGrow: 1,
        right: 'unset',
        top: 'unset',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        pointerEvents: 'none',
        flexDirection: 'row',
        transform: 'none',
        justifyContent: 'flex-end',
        '& > *': { pointerEvents: 'all' },
    },
    button: {
        borderRadius: theme.spacing(0.5),
        padding: 2,
        '& svg': {
            width: 18,
            height: 18,
        },
    },
    avatar: {
        minWidth: theme.spacing(3),
        display: 'flex',
    },
    startAction: {
        marginLeft: -(theme.spacing(0.5) + 22),
        marginRight: theme.spacing(0.5),
        display: 'flex',
    },
    textContainer: {
        flexGrow: 0,
        margin: 0,
    },
}));

function ItemAction({ className: externalClassName, children, ...props }, ref) {
    const classes = useStyles();

    return (
        <ButtonBase
            ref={ref}
            className={clsx(classes.button, externalClassName)}
            {...props}
        >
            {children}
        </ButtonBase>
    );
}

const ForwardRefItemAction = forwardRef(ItemAction);

function Item(props, ref) {
    const {
        title,
        level = 0,
        icon,
        startAction,
        actions,
        onClick,
        disableButton = false,
        className: externalClassName,
        ...otherProps
    } = props;
    const classes = useStyles();
    const startActionRef = useRef();
    const actionsRef = useRef();

    return (
        <ListItem
            ref={ref}
            classes={{
                root: clsx(classes.itemRoot, externalClassName),
                container: classes.itemContainer,
            }}
            button={!disableButton}
            style={{ paddingLeft: Number.isFinite(level) ? (30 + level * 8) : null }}
            onClick={(event) => {
                if (
                    event.nativeEvent.composedPath().includes(startActionRef.current)
                    || event.nativeEvent.composedPath().includes(actionsRef.current)
                ) {
                    event.stopPropagation();
                    event.preventDefault();
                    return;
                }

                if (onClick) onClick(event);
            }}
            {...otherProps}
        >
            {startAction && (
                <Box className={classes.startAction} ref={startActionRef}>{startAction}</Box>
            )}
            {icon && (
                <ListItemAvatar className={classes.avatar}>
                    {icon}
                </ListItemAvatar>
            )}
            <ListItemText
                // inset={!icon}
                primary={title}
                classes={{
                    root: classes.textContainer,
                    primary: classes.text,
                    inset: classes.itemInset,
                }}
            />
            <Box className={classes.actions} ref={actionsRef}>
                {actions}
            </Box>
        </ListItem>
    );
}

const ForwardRefItem = forwardRef(Item);

export default ForwardRefItem;

export {
    ForwardRefItem as Item,
    ForwardRefItemAction as ItemAction,
};
