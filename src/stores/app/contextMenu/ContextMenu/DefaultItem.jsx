import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
    Box,
    ListItem,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
} from '@material-ui/core';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
    item: {
        padding: theme.spacing(0.5, 1.5),
        margin: theme.spacing(0, 0.625),
        width: `calc(100% - ${theme.spacing(1.25)}px)`,
        borderRadius: theme.shape.borderRadiusButton,
    },
    icon: {
        minWidth: 22 + 12,
        display: 'flex',
        alignItems: 'center',
        '& svg': {
            width: 22,
            height: 22,
        },
    },
    secondaryAction: {
        justifyContent: 'flex-end',
        display: 'flex',
        alignItems: 'center',
        justifySelf: 'center',
        position: 'relative',
        right: 'unset',
        top: 'unset',
        transform: 'unset',
        flexShrink: 0,
        flexGrow: 1,
        paddingLeft: theme.spacing(1),
        // paddingRight: theme.spacing(2),
    },
    itemContainer: { display: 'flex' },
    itemHelper: {
        display: 'flex',
        width: '100%',
    },
}));

function DefaultItem(props) {
    const {
        icon,
        title,
        disabled,
        description,
        iconProps,
        action,
        onClick,
        service,
        classes: externalClassName = {},
    } = props;
    const classes = useStyles();

    const Icon = icon;

    return (
        <ListItem
            classes={{ container: classes.itemContainer }}
            className={classes.item}
            key={title}
            button={Boolean(onClick)}
            dense
            disabled={disabled}
            onClick={async () => {
                const result = await onClick(() => {
                    service.close();
                });

                if (!result) {
                    service.close();
                }
            }}
        >
            <Box className={classes.itemHelper}>
                <ListItemIcon className={clsx(classes.icon, externalClassName.itemIconContainer)}>
                    {Icon && (<Icon {...iconProps} />)}
                </ListItemIcon>
                <ListItemText primary={title} secondary={description} />
                {action && (
                    <ListItemSecondaryAction className={classes.secondaryAction}>
                        {action}
                    </ListItemSecondaryAction>
                )}
            </Box>
        </ListItem>
    );
}

export default observer(DefaultItem);
