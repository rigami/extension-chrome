import { ListItem, ListItemText } from '@material-ui/core';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
    textWrapper: { maxWidth: 700 },
    text: {
        fontFamily: theme.typography.fontFamily,
        fontWeight: 800,
        fontSize: '1.2rem',
    },
    title: {},
    secondary: { fontSize: '1rem' },
}));

function Header({ title, subtitle, classes: externalClasses = {}, className: externalClassName }) {
    const classes = useStyles();

    return (
        <ListItem
            disableGutters
            component="div"
            classes={{ root: clsx(classes.root, externalClasses.root, externalClassName) }}
        >
            <ListItemText
                classes={{
                    root: classes.textWrapper,
                    primary: clsx(classes.text, classes.title, externalClasses.title),
                    secondary: clsx(classes.text, classes.secondary, externalClasses.secondary),
                }}
                primary={title}
                secondary={subtitle}
            />
        </ListItem>
    );
}

export default Header;
