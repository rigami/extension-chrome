import React, { useEffect, useState } from 'react';
import {
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    MenuItem,
    Select,
    Slider,
    Switch,
    Box,
    Checkbox, ListItemIcon,
    TextField,
} from '@material-ui/core';
import {
    NavigateNextRounded as ArrowRightIcon,
    UnfoldMoreRounded as ArrowBottomIcon,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';

const useStyles = makeStyles((theme) => ({
    root: {
        paddingRight: theme.spacing(4),
        flexDirection: 'column',
        alignItems: 'stretch',
    },
    secondaryAction: {
        width: '100%',
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
        marginLeft: theme.spacing(1),
    },
    noPointerEvents: { pointerEvents: 'none' },
    rowWrapper: {
        display: 'flex',
        position: 'relative',
        textAlign: 'left',
        width: '100%',

    },
    bodyWrapper: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingLeft: 56,
        paddingBottom: theme.spacing(1.5),
    },
    textWrapper: {},
    linkArrow: { marginLeft: theme.spacing(1) },
    icon: { alignSelf: 'center' },
}));

const TYPE = {
    LINK: 'LINK',
    SLIDER: 'SLIDER',
    SELECT: 'SELECT',
    MULTISELECT: 'MULTISELECT',
    CHECKBOX: 'CHECKBOX',
    NONE: 'NONE',
    CUSTOM: 'CUSTOM',
};

function MenuRow(props) {
    const {
        title,
        description,
        icon,
        disableIconInsert = false,
        className: externalClassName,
        classes: externalClasses = {},
        action: {
            type: actionType = TYPE.NONE,
            width: actionWidth = 252,
            format: actionFormat = (value) => value,
            ...actionProps
        } = {},
        width,
        children,
        onClick: rootOnClick,
    } = props;
    const classes = useStyles();
    const { t } = useTranslation();

    const [value, setValue] = useState(
        (actionType === TYPE.CHECKBOX && actionProps.checked)
        || actionProps.value,
    );

    useEffect(() => {
        setValue(
            (actionType === TYPE.CHECKBOX && actionProps.checked)
            || actionProps.value,
        );
    }, [actionProps.checked, actionProps.value]);

    const Icon = icon;

    return (
        <ListItem
            classes={{ root: clsx(classes.root, externalClassName) }}
            style={{ width }}
            button={
                actionType === TYPE.LINK
                || actionType === TYPE.CHECKBOX
                || (actionType === TYPE.CUSTOM && rootOnClick)
            }
            onClick={(event) => {
                if (actionType === TYPE.CUSTOM && rootOnClick) rootOnClick(event);
                if (actionType === TYPE.LINK && actionProps.onClick) actionProps.onClick(event);
                if (actionType === TYPE.CHECKBOX) {
                    setValue(!value);
                    if (actionProps.onChange) actionProps.onChange(event, !value);
                }
            }}
        >
            <div className={classes.rowWrapper}>
                {icon && (
                    <ListItemIcon className={classes.icon}>
                        <Icon />
                    </ListItemIcon>
                )}
                <ListItemText
                    primary={title}
                    secondary={description}
                    className={classes.textWrapper}
                    inset={!icon && !disableIconInsert}
                />
                {actionType !== TYPE.NONE && (
                    <ListItemSecondaryAction
                        className={clsx(
                            actionType === TYPE.LINK && classes.noPointerEvents,
                            classes.secondaryAction,
                        )}
                        style={{ maxWidth: actionWidth }}
                    >
                        {actionType === TYPE.LINK && (
                            <React.Fragment>
                                {actionProps && actionProps.component}
                                <ArrowRightIcon className={classes.linkArrow} />
                            </React.Fragment>
                        )}
                        {actionType === TYPE.SLIDER && (
                            <Slider valueLabelDisplay="auto" {...actionProps} />
                        )}
                        {actionType === TYPE.SELECT && (
                            <TextField
                                {...actionProps}
                                variant="filled"
                                size="small"
                                select
                                SelectProps={{ IconComponent: ArrowBottomIcon }}
                                style={{ width: '100%' }}
                            >
                                {actionProps.values.map((actionValue) => (
                                    <MenuItem key={actionValue} value={actionValue}>
                                        {actionFormat?.(actionValue) || actionValue}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}
                        {actionType === TYPE.MULTISELECT && (
                            <TextField
                                {...actionProps}
                                variant="filled"
                                size="small"
                                style={{ width: '100%' }}
                                select
                                SelectProps={{
                                    multiple: true,
                                    IconComponent: ArrowBottomIcon,
                                    displayEmpty: true,
                                    renderValue: (selected) => {
                                        console.log('selected:', selected);

                                        if (actionProps.value && (actionProps.value.length === 0)) {
                                            return actionFormat?.('nothingSelected') || t('nothingSelected');
                                        } else if (
                                            actionProps.values && actionProps.value
                                            && (actionProps.values.length === actionProps.value.length)
                                        ) {
                                            return actionFormat?.('all') || t('all');
                                        } else {
                                            return selected && selected
                                                .map((actionValue) => (actionFormat?.(actionValue) || actionValue))
                                                .join(', ');
                                        }
                                    },
                                }}
                            >
                                {actionProps.values.map((actionValue) => (
                                    <MenuItem key={actionValue} value={actionValue}>
                                        <Checkbox
                                            color="primary"
                                            checked={actionProps.value && actionProps.value.indexOf(actionValue) > -1}
                                        />
                                        <ListItemText
                                            primary={actionFormat?.(actionValue) || actionValue}
                                        />
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}
                        {actionType === TYPE.CHECKBOX && (
                            <Switch
                                edge="end"
                                checked={value}
                                color="primary"
                                {...actionProps}
                            />
                        )}
                        {actionType === TYPE.CUSTOM && (
                            actionProps.component
                        )}
                    </ListItemSecondaryAction>
                )}
            </div>
            {children && (
                <Box className={clsx(classes.bodyWrapper, externalClasses.bodyWrapper)}>{children}</Box>
            )}
        </ListItem>
    );
}

export const ROWS_TYPE = TYPE;
export default observer(MenuRow);
