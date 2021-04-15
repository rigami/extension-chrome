import React from 'react';
import { AppBar, Toolbar, Box } from '@material-ui/core';
import { fade, makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';
import { useResizeDetector } from 'react-resize-detector';
import FolderBreadcrumbs from './FolderBreadcrumbs';
import SearchBlock from './Search';
import ShowFavorites from './ShowFavorites';

const useStyles = makeStyles((theme) => ({
    root: { backgroundColor: fade(theme.palette.background.paper, 0.95) },
    toolbar: {
        minHeight: theme.spacing(9.75),
        display: 'flex',
        padding: theme.spacing(2),
        alignItems: 'flex-start',
    },
    wrapperBreadcrumbs: { flexShrink: 0 },
    wrapperSearch: {
        padding: theme.spacing(0, 2),
        display: 'flex',
        flexGrow: 1,
        flexShrink: 0,
        justifyContent: 'center',
        maxWidth: (theme.shape.dataCard.width + theme.spacing(2)) * 3 + theme.spacing(2),
        width: '100%',
        margin: 'auto',
        marginTop: 0,
        boxSizing: 'content-box',
    },
    wrapperTools: {
        flexShrink: 0,
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
                    <FolderBreadcrumbs
                        key={service.activeFolderId}
                        folderId={service.activeFolderId}
                        onSelectFolder={(folderId) => service.setActiveFolder(folderId)}
                    />
                </Box>
                <Box className={classes.widthHelper} style={{ maxWidth: widthTools || undefined }} />
                <Box className={classes.wrapperSearch}>
                    <SearchBlock searchService={service} />
                </Box>
                <Box className={classes.widthHelper} style={{ maxWidth: (widthBreadcrumbs || 0) + 260 }} />
                <Box className={classes.wrapperTools} ref={refTools}>
                    <ShowFavorites />
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default observer(ToolsPanel);
