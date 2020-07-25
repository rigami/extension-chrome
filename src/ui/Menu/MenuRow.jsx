import React, { useState } from 'react';
import {
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    MenuItem,
    Select,
    Slider,
    Switch,
    Box,
    Checkbox,
} from '@material-ui/core';
import {
    NavigateNextRounded as ArrowRightIcon,
    ExpandMoreRounded as ArrowBottomIcon,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

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
    const classes = useStyles();
    const {
        title,
        description,
        withoutIcon,
        action: {
            type: actionType = TYPE.NONE,
            width: actionWidth = 252,
            ...actionProps
        } = {},
        width = 750,
        children,
    } = props;
    const { t } = useTranslation();

    const [value, setValue] = useState(
        (actionType === TYPE.CHECKBOX && actionProps.checked)
        || actionProps.value,
    );

    return (
        <ListItem
            classes={{ root: classes.root }}
            style={{ width }}
            button={actionType === TYPE.LINK || actionType === TYPE.CHECKBOX}
            onClick={(event) => {
                if (actionType === TYPE.LINK && actionProps.onClick) actionProps.onClick(event);
                if (actionType === TYPE.CHECKBOX) {
                    setValue(!value);
                    if (actionProps.onChange) actionProps.onChange(event, !value);
                }
            }}
        >
            <div className={classes.rowWrapper}>
                <ListItemText
                    primary={title}
                    secondary={description}
                    className={classes.textWrapper}
                    inset={!withoutIcon}
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
                            <Slider {...actionProps} valueLabelDisplay="auto" />
                        )}
                        {actionType === TYPE.SELECT && (
                            <Select
                                {...actionProps}
                                variant="outlined"
                                style={{ width: '100%' }}
                                IconComponent={ArrowBottomIcon}
                            >
                                {actionProps.values.map((actionValue) => (
                                    <MenuItem key={actionValue} value={actionValue}>
                                        {actionProps.format?.(actionValue) || actionValue}
                                    </MenuItem>
                                ))}
                            </Select>
                        )}
                        {actionType === TYPE.MULTISELECT && (
                            <Select
                                {...actionProps}
                                variant="outlined"
                                style={{ width: '100%' }}
                                multiple
                                IconComponent={ArrowBottomIcon}
                                displayEmpty
                                renderValue={(selected) => {
                                    if (actionProps.value && (actionProps.value.length === 0)) {
                                        return actionProps.format?.("nothingSelected") || t("nothingSelected");
                                    } else if (
                                        actionProps.values && actionProps.value
                                        && (actionProps.values.length === actionProps.value.length)
                                    ) {
                                        return actionProps.format?.("all") || t("all");
                                    } else {
                                        return selected && selected
                                            .map((actionValue) => (actionProps.format?.(actionValue)|| actionValue))
                                            .join(', ');
                                    }
                                }}
                            >
                                {actionProps.values.map((actionValue) => (
                                    <MenuItem key={actionValue} value={actionValue}>
                                        <Checkbox
                                            color="primary"
                                            checked={actionProps.value && actionProps.value.indexOf(actionValue) > -1}
                                        />
                                        <ListItemText
                                            primary={actionProps.format?.(actionValue) || actionValue}
                                        />
                                    </MenuItem>
                                ))}
                            </Select>
                        )}
                        {actionType === TYPE.CHECKBOX && (
                            <Switch
                                edge="end"
                                checked={value}
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
                <Box className={classes.bodyWrapper}>{children}</Box>
            )}
        </ListItem>
    );
}


export const ROWS_TYPE = TYPE;
export default MenuRow;
