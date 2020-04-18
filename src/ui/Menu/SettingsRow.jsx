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
    },
    noPointerEvents: {
        pointerEvents: 'none',
    },
    rowWrapper: {
        display: 'flex',
        position: 'relative',
        textAlign: 'left',
        alignItems: 'center',
        paddingRight: 284,
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
}));

class SettingsRow extends Component {
    constructor() {
        super();
    }

    static TYPE = {
        LINK: "link",
        SLIDER: "slider",
        SELECT: "select",
        MULTISELECT: "multiselect",
        CHECKBOX: "checkbox",
    };

    render({title, description, action, children}) {
        const classes = useStyles();

        return (
            <ListItem
                classes={{
                    root: classes.root,
                }}
                button={action && action.type === SettingsRow.TYPE.LINK}
                onClick={action && action.type === SettingsRow.TYPE.LINK && action.onClick}
            >
                <div className={classes.rowWrapper}>
                    <ListItemAvatar/>
                    <ListItemText
                        primary={title}
                        secondary={description}
                    />
                    {action && (
                        <ListItemSecondaryAction
                            className={clsx(
                                action.type === SettingsRow.TYPE.LINK && classes.noPointerEvents,
                                classes.secondaryAction
                            )}
                        >
                            {action.type === SettingsRow.TYPE.LINK && (
                                <ArrowRightIcon/>
                            )}
                            {action.type === SettingsRow.TYPE.SLIDER && (
                                <Slider {...action} valueLabelDisplay="auto"/>
                            )}
                            {action.type === SettingsRow.TYPE.SELECT && (
                                <Select
                                    {...action}
                                    value={action.value}
                                    variant="outlined"
                                    style={{width: '100%'}}
                                    IconComponent={ArrowBottomIcon}
                                >
                                    {action.values.map((value) => (
                                        <MenuItem key={value} value={value}>
                                            {action.locale && action.locale[value] || value}
                                        </MenuItem>
                                    ))}
                                </Select>
                            )}
                            {action.type === SettingsRow.TYPE.MULTISELECT && (
                                <Select
                                    {...action}
                                    value={action.value}
                                    variant="outlined"
                                    style={{ width: '100%' }}
                                    multiple

                                    IconComponent={ArrowBottomIcon}
                                    displayEmpty
                                    renderValue={(selected) => {
                                        if (action.value.length === 0) {
                                            return locale.global.nothing_selected;
                                        } else if (action.values.length === action.value.length) {
                                            return locale.global.all;
                                        } else {
                                            return selected
                                                .map(value => action.locale && action.locale[value] || value)
                                                .join(', ');
                                        }
                                    }}
                                >
                                    {action.values.map((value) => (
                                        <MenuItem key={value} value={value}>
                                            <Checkbox
                                                color="primary"
                                                checked={action.value.indexOf(value) > -1}
                                            />
                                            <ListItemText primary={action.locale && action.locale[value] || value}/>
                                        </MenuItem>
                                    ))}
                                </Select>
                            )}
                            {action.type === SettingsRow.TYPE.CHECKBOX && (
                                <Switch
                                    edge="end"
                                    {...action}
                                />
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
}

export default SettingsRow;