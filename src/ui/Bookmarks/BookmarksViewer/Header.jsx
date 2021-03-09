import { ListItem, ListItemText } from '@material-ui/core';
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
    container: {
        marginTop: theme.spacing(3),
        listStyle: 'none',
    },
    textWrapper: { maxWidth: 700 },
    text: {
        fontFamily: theme.typography.primaryFontFamily,
        fontWeight: 800,
        fontSize: '1.2rem',
    },
    title: {},
    secondary: { fontSize: '1rem' },
}));

function Header({ title, subtitle }) {
    const classes = useStyles();

    return (
        <ListItem
            disableGutters
            component="div"
            classes={{ container: classes.container }}
        >
            <ListItemText
                classes={{
                    root: classes.textWrapper,
                    primary: clsx(classes.text, classes.title),
                    secondary: clsx(classes.text, classes.secondary),
                }}
                primary={title}
                secondary={subtitle}
            />
        </ListItem>
    );
}

export default Header;
