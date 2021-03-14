import React from 'react';
import { AppBar, Toolbar } from '@material-ui/core';
import { fade, makeStyles } from '@material-ui/core/styles';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { debounce } from 'lodash';
import ShowFavoriteSwitcher from '@/ui/Bookmarks/ToolsPanel/ShowFavoriteSwitcher';
import Search from './Search';
import Tags from './Tags';
import SearchPlace from './SearchPlace';

const useStyles = makeStyles((theme) => ({
    root: {
        backgroundColor: fade(theme.palette.background.paper, 0.95),
        overflow: 'hidden',
    },
    toolbar: { minHeight: theme.spacing(10.5) },
}));

function ToolsPanel({ onResearch }) {
    const classes = useStyles();
    const store = useLocalObservable(() => ({ searchRequest: {} }));

    const search = debounce(() => {
        onResearch(store.searchRequest);
    }, 400);

    const handleChangeRequest = (changeRequest) => {
        store.searchRequest = {
            ...store.searchRequest,
            ...changeRequest,
        };

        search();
    };

    return (
        <AppBar
            position="sticky"
            color="transparent"
            elevation={0}
            className={classes.root}
        >
            <Toolbar disableGutters className={classes.toolbar}>
                <Search onResearch={handleChangeRequest} />
                <Tags onResearch={handleChangeRequest} />
                <SearchPlace onResearch={handleChangeRequest} />
                <ShowFavoriteSwitcher onResearch={handleChangeRequest} />
            </Toolbar>
        </AppBar>
    );
}

export default observer(ToolsPanel);
