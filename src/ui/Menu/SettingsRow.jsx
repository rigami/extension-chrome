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
        paddingRight: 16,
        width: 750,
        flexDirection: 'column',
        alignItems: 'stretch',
    },
    secondaryAction: {
        width: 220,
        justifyContent: 'flex-end',
        display: 'flex',
        marginRight: 16,
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
        paddingLeft: '56px',
    },
}));

class SettingsRow extends Component {
    constructor() {
        super();
    }

    static TYPE = {
        LINK: "link",
        SLIDER: "slider",
        DROPDOWN: "dropdown",
        CHECKBOX: "checkbox",
    };

    render({ title, description, action, children }) {
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
                            {action.type === SettingsRow.TYPE.DROPDOWN && (
                                <Select
                                    value={action.defaultValue}
                                    variant="outlined"
                                    style={{ width: '100%' }}
                                    {...action}
                                >
                                    {action.values.map((value) => (
                                        <MenuItem value={value}>{action.locale && action.locale[value] || value}</MenuItem>
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