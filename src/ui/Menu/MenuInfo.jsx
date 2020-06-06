import React from 'react';

import { fade } from '@material-ui/core/styles/colorManipulator';
import {
    ListItem,
    ListItemIcon,
    ListItemText,
    Collapse,
} from '@material-ui/core';
import { InfoRounded as InfoIcon } from '@material-ui/icons';
// import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    root: { backgroundColor: theme.palette.warning.main },
    icon: { color: theme.palette.warning.contrastText },
    messageText: { color: theme.palette.warning.contrastText },
    descriptionText: { color: fade(theme.palette.warning.contrastText, 0.8) },
}));

function MenuInfo({ show, message, description, width }) {
    const classes = useStyles();

    return (
        <Collapse in={show}>
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
            </ListItem>
        </Collapse>
    );
}

/* MenuInfo.propTypes = {
    show: PropTypes.bool.isRequired,
    message: PropTypes.string.isRequired,
    description: PropTypes.string,
    width: PropTypes.number.isRequired,
};

MenuInfo.defaultProps = { description: null }; */

export default MenuInfo;
