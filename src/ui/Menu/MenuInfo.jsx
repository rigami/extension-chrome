import React from 'react';
import { fade } from '@material-ui/core/styles/colorManipulator';
import {
    ListItem,
    ListItemIcon,
    ListItemText,
    Collapse,
    ListItemSecondaryAction,
} from '@material-ui/core';
import { InfoRounded as InfoIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    root: { backgroundColor: theme.palette.warning.main },
    icon: { color: theme.palette.warning.contrastText },
    messageText: { color: theme.palette.warning.contrastText },
    descriptionText: { color: fade(theme.palette.warning.contrastText, 0.8) },
    actions: { color: theme.palette.warning.contrastText }
}));

function MenuInfo(props) {
    const {
        show,
        message,
        description,
        width,
        classes: externalClasses = {},
        actions,
    } = props;
    const classes = useStyles();

    return (
        <Collapse in={show} className={externalClasses.wrapper}>
            <ListItem className={classes.root} style={{ width }}>
                <ListItemIcon>
                    <InfoIcon className={classes.icon} />
                </ListItemIcon>
                <ListItemText
                    classes={{
                        primary: classes.messageText,
                        secondary: classes.descriptionText,
                    }}
                    primary={message}
                    secondary={description}
                />
                {actions && (
                    <ListItemSecondaryAction className={classes.actions}>
                        {actions}
                    </ListItemSecondaryAction>
                )}
            </ListItem>
        </Collapse>
    );
}

export default MenuInfo;
