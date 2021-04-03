import React from 'react';
import { AppBar, Toolbar, Box } from '@material-ui/core';
import { fade, makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import clsx from 'clsx';
import FolderBreadcrumbs from '@/ui/Bookmarks/FolderBreadcrumbs';
import { useResizeDetector } from 'react-resize-detector';
import SearchBlock from './SearchBlock';
import Tags from './Tags';
import SearchPlace from './SearchPlace';
import ShowFavorites from './ShowFavorites';

const useStyles = makeStyles((theme) => ({
    root: { backgroundColor: fade(theme.palette.background.paper, 0.95) },
    toolbar: {
        minHeight: theme.spacing(9.75),
        display: 'flex',
    },
    wrapperBreadcrumbs: {},
    wrapperSearch: {
        padding: theme.spacing(0, 2),
        display: 'flex',
        flexGrow: 1,
        justifyContent: 'center',
        width: 600,
    },
    wrapperTools: {
        paddingRight: theme.spacing(2),
        display: 'flex',
    },
    widthHelper: {
        flexShrink: 1,
        display: 'flex',
        flexGrow: 1,
    },
}));

function ToolsPanel({ searchService: service }) {
    const classes = useStyles();
    const { width: widthBreadcrumbs, ref: refBreadcrumbs } = useResizeDetector();
    const { width: widthTools, ref: refTools } = useResizeDetector();

    return (
        <AppBar
            position="sticky"
            color="transparent"
            elevation={0}
            className={classes.root}
        >
            <Toolbar disableGutters className={classes.toolbar}>
                <Box className={classes.wrapperBreadcrumbs} ref={refBreadcrumbs}>
                    <FolderBreadcrumbs searchService={service} />
                </Box>
                <Box className={classes.widthHelper} style={{ maxWidth: widthTools }} />
                <Box className={classes.wrapperSearch}>
                    <SearchBlock searchService={service} />
                </Box>
                <Box className={classes.widthHelper} style={{ maxWidth: widthBreadcrumbs + 260 }} />
                <Box className={classes.wrapperTools} ref={refTools}>
                    <ShowFavorites />
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default observer(ToolsPanel);
