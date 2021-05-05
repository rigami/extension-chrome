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
        paddingRight: theme.spacing(1),
        position: 'relative',
    },
    itemContainer: {
        '& $addSubFolder': { opacity: 0 },
        '&:hover $addSubFolder': { opacity: 1 },
    },
    itemInset: { paddingLeft: 22 },
    text: {
        color: theme.palette.text.secondary,
        fontSize: '0.9rem',
        fontWeight: 550,
        fontFamily: theme.typography.primaryFontFamily,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        letterSpacing: 'inherit',
    },
    actions: {
        marginLeft: 'auto',
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
    avatar: { minWidth: theme.spacing(3) },
    startAction: {
        marginLeft: -(theme.spacing(0.5) + 22),
        marginRight: theme.spacing(0.5),
        display: 'flex',
    },
    textContainer: { flexGrow: 0 },
}));

function ItemAction({ className: externalClassName, children, ...props }) {
    const classes = useStyles();

    return (
        <ButtonBase
            className={clsx(classes.button, externalClassName)}
            {...props}
        >
            {children}
        </ButtonBase>
    );
}

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
            style={{ paddingLeft: 30 + level * 8 }}
            onClick={(event) => {
                if (
                    event.nativeEvent.path.includes(startActionRef.current)
                    || event.nativeEvent.path.includes(actionsRef.current)
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
    ItemAction,
};
