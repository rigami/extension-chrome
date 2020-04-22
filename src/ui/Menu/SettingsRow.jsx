import React, {useState, useRef} from "preact/compat";
import {h, Component, render, Fragment} from "preact";
import {
    ListItem,
    ListItemAvatar,
    ListItemSecondaryAction,
    ListItemText,
    MenuItem,
    Select,
    Slider,
    Switch,
    Box,
    ListItemIcon,
    Checkbox,
    Menu,
} from "@material-ui/core";
import {
    NavigateNextRounded as ArrowRightIcon,
    ExpandMoreRounded as ArrowBottomIcon,
} from "@material-ui/icons";
import {makeStyles} from "@material-ui/core/styles";
import clsx from "clsx";
import settings from "../../config/settings";
import {BG_CHANGE_INTERVAL} from "../../dict";
import locale from "../../i18n/RU";

const useStyles = makeStyles(theme => ({
    root: {
        paddingRight: theme.spacing(4),
        width: 750,
        flexDirection: 'column',
        alignItems: 'stretch',
    },
    secondaryAction: {
        width: 252,
        justifyContent: 'flex-end',
        display: 'flex',
        alignItems: 'center',
        justifySelf: 'center',
        position: 'relative',
        right: 'unset',
        top: 'unset',
        transform: 'unset',
        flexShrink: 0,
        flexGrow: 0,
    },
    noPointerEvents: {
        pointerEvents: 'none',
    },
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
    textWrapper: {
        minHeight: '44px',
    },
    linkArrow: {
        marginLeft: theme.spacing(1),
    },
}));

const TYPE = {
    LINK: "LINK",
    SLIDER: "SLIDER",
    SELECT: "SELECT",
    MULTISELECT: "MULTISELECT",
    CHECKBOX: "CHECKBOX",
    NONE: "NONE",
    CUSTOM: "CUSTOM",
};

function SettingsRow({title, description, action: { type: actionType = TYPE.NONE, ...actionProps} = {}, children}) {
    const classes = useStyles();

    return (
        <ListItem
            classes={{
                root: classes.root,
            }}
            button={actionType === TYPE.LINK}
            onClick={actionType === TYPE.LINK && actionProps.onClick}
        >
            <div className={classes.rowWrapper}>
                <ListItemAvatar/>
                <ListItemText
                    primary={title}
                    secondary={description}
                    className={classes.textWrapper}
                />
                {actionType !== TYPE.NONE && (
                    <ListItemSecondaryAction
                        className={clsx(
                            actionType === TYPE.LINK && classes.noPointerEvents,
                            classes.secondaryAction
                        )}
                    >
                        {actionType === TYPE.LINK && (
                            <Fragment>
                                {actionProps && actionProps.component}
                                <ArrowRightIcon className={classes.linkArrow}/>
                            </Fragment>
                        )}
                        {actionType === TYPE.SLIDER && (
                            <Slider {...actionProps} valueLabelDisplay="auto"/>
                        )}
                        {actionType === TYPE.SELECT && (
                            <Select
                                {...actionProps}
                                variant="outlined"
                                style={{width: '100%'}}
                                IconComponent={ArrowBottomIcon}
                            >
                                {actionProps.values.map((value) => (
                                    <MenuItem key={value} value={value}>
                                        {actionProps.locale && actionProps.locale[value] || value}
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
                                        return locale.global.nothing_selected;
                                    } else if (actionProps.values && actionProps.value && (actionProps.values.length === actionProps.value.length)) {
                                        return locale.global.all;
                                    } else {
                                        return selected && selected
                                            .map(value => actionProps.locale && actionProps.locale[value] || value)
                                            .join(', ');
                                    }
                                }}
                            >
                                {actionProps.values.map((value) => (
                                    <MenuItem key={value} value={value}>
                                        <Checkbox
                                            color="primary"
                                            checked={actionProps.value && actionProps.value.indexOf(value) > -1}
                                        />
                                        <ListItemText primary={actionProps.locale && actionProps.locale[value] || value}/>
                                    </MenuItem>
                                ))}
                            </Select>
                        )}
                        {actionType === TYPE.CHECKBOX && (
                            <Switch
                                edge="end"
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

export default SettingsRow;