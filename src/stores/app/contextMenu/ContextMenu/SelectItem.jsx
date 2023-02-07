import React, { useRef, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import {
    Box,
    ListItem,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    MenuItem,
    TextField,
} from '@material-ui/core';
import { UnfoldMoreRounded as ArrowBottomIcon } from '@material-ui/icons';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
    item: {
        padding: theme.spacing(0.5, 1.5),
        paddingRight: theme.spacing(0.5),
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
    itemHelper: { display: 'flex' },
    select: {
        marginLeft: theme.spacing(1),
        width: '100%',
    },
    inputSelect: {
        background: 'none !important',
        color: theme.palette.primary.dark,
        paddingTop: 0,
        paddingBottom: 0,
        textAlign: 'right',
        paddingRight: '42px !important',
    },
    rootSelect: {
        background: 'none !important',
        boxShadow: 'none !important',
    },
}));

function SelectItem(props) {
    const {
        icon,
        title,
        disabled,
        description,
        iconProps,
        variants,
        value,
        action,
        onChange,
        service,
        classes: externalClassName = {},
    } = props;
    const { t } = useTranslation();
    const classes = useStyles();
    const ref = useRef();
    const [open, setOpen] = useState(false);

    const handleClose = () => {
        setOpen(false);
    };

    const handleOpen = (event) => {
        if (event.nativeEvent.composedPath().includes(ref.current)) {
            setOpen(true);
        }
    };

    const handleChange = (event) => {
        onChange(event.target.value);

        handleClose();
    };

    const Icon = icon;

    return (
        <ListItem
            classes={{ container: classes.itemContainer }}
            className={classes.item}
            key={title}
            button
            dense
            disabled={disabled}
            onClick={handleOpen}
            ref={ref}
        >
            <Box className={classes.itemHelper}>
                <ListItemIcon className={clsx(classes.icon, externalClassName.itemIconContainer)}>
                    {Icon && (<Icon {...iconProps} />)}
                </ListItemIcon>
                <ListItemText primary={title} secondary={description} />
            </Box>
            <TextField
                variant="filled"
                size="small"
                select
                SelectProps={{
                    IconComponent: ArrowBottomIcon,
                    open,
                    onClose: handleClose,
                    onChange: handleChange,
                    classes: { root: classes.inputSelect },
                }}
                InputProps={{ classes: { root: classes.rootSelect } }}
                className={classes.select}
                value={value || ''}
            >
                {variants.map((variant) => (
                    <MenuItem key={variant} value={variant.value}>
                        {variant.label}
                    </MenuItem>
                ))}
            </TextField>
            {action && (
                <ListItemSecondaryAction className={classes.secondaryAction}>
                    {action}
                </ListItemSecondaryAction>
            )}
        </ListItem>
    );
}

export default observer(SelectItem);
