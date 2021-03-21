import React from 'react';
import { AppBar, Toolbar } from '@material-ui/core';
import { fade, makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import Search from './Search';
import Tags from './Tags';
import SearchPlace from './SearchPlace';

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: fade(theme.palette.background.paper, 0.95),
        overflow: 'hidden',
    },
    toolbar: {
        minHeight: theme.spacing(10.5),
        paddingRight: theme.spacing(4),
    },
}));

function ToolsPanel({ searchService: service }) {
    const classes = useStyles();

    return (
        <AppBar
            position="sticky"
            color="transparent"
            elevation={0}
            className={classes.root}
        >
            <Toolbar disableGutters className={classes.toolbar}>
                <Search searchService={service} />
                <Tags searchService={service} />
                <SearchPlace searchService={service} />
                {/* <ShowFavoriteSwitcher searchRequest={store.searchRequest} onResearch={handleChangeRequest} /> */}
            </Toolbar>
        </AppBar>
    );
}

export default observer(ToolsPanel);
