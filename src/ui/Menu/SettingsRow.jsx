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
        paddingRight: 284,
        width: 750,
    },
    secondaryAction: {
        width: 220,
        justifyContent: 'flex-end',
        display: 'flex',
        marginRight: 16,
    },
    noPointerEvents: {
        pointerEvents: 'none',
    }
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

    render({ title, description, action }) {
        const classes = useStyles();

        return (
            <ListItem
                classes={{
                    root: classes.root,
                }}
                button={action && action.type === SettingsRow.TYPE.LINK}
                onClick={action && action.type === SettingsRow.TYPE.LINK && action.onClick}
            >
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
                            <Slider {...action}/>
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
            </ListItem>
        );
    }
}

export default SettingsRow;