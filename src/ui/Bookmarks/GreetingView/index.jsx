import React from 'react';
import { Box } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import SearchBlock from '@/ui/Bookmarks/ToolsPanel/Search';
import Favorites from './Favorites';
import Widgets from './Widgets';
import Greeting from './Greeting';

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexGrow: 1,
        flexDirection: 'row',
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        marginRight: 58,
        maxWidth: 1300,
    },
    main: {
        flexGrow: 1,
        maxWidth: 1000,
        width: '100%',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
    },
    sidebar: {},
    widgetContainer: { margin: theme.spacing(1.5, 0) },
    searchContainer: {
        margin: theme.spacing(3, 0),
        marginTop: theme.spacing(4),
        maxWidth: 1000,
    },
    favoritesContainer: { maxWidth: 1000 },
}));

function GreetingView({ searchService: service }) {
    const classes = useStyles();

    return (
        <Box className={classes.root}>
            <Box className={classes.main}>
                <Greeting />
                <Widgets className={classes.widgetContainer} />
                <Favorites className={classes.favoritesContainer} />
            </Box>
        </Box>
    );
}

export default observer(GreetingView);
