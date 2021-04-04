import React, { useEffect } from 'react';
import {
    Box,
    Breadcrumbs,
    Link,
    Typography,
} from '@material-ui/core';
import { useLocalObservable, observer } from 'mobx-react-lite';
import { FETCH } from '@/enum';
import FoldersUniversalService from '@/stores/universal/bookmarks/folders';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    root: {
        height: 42,
        display: 'flex',
        alignItems: 'center',
    },
}));

function FolderBreadcrumbs({ searchService: service }) {
    const classes = useStyles();
    const bookmarksService = useBookmarksService();
    const store = useLocalObservable(() => ({
        path: null,
        pathState: FETCH.WAIT,
    }));

    useEffect(() => {
        if (service.activeFolderId === null) {
            store.path = null;
            store.pathState = FETCH.WAIT;
            return;
        }

        store.pathState = FETCH.PENDING;

        FoldersUniversalService.getPath(service.activeFolderId)
            .then((path) => {
                store.path = path;
                store.pathState = FETCH.DONE;
            });
    }, [service.activeFolderId, bookmarksService.lastTruthSearchTimestamp]);

    return (
        <Box className={classes.root} visibility={service.searchEverywhere ? 'hidden' : 'visible'}>
            <Breadcrumbs>
                {store.path && store.path.map((folder, index) => (index === store.path.length - 1 ? (
                    <Typography
                        key={folder.id}
                        color="textPrimary"
                    >
                        {folder.name}
                    </Typography>
                ) : (
                    <Link
                        key={folder.id}
                        color="textSecondary"
                        href="/"
                        onClick={(event) => {
                            event.preventDefault();
                            service.setActiveFolder(folder.id);
                        }}
                    >
                        {folder.name}
                    </Link>
                )))}
            </Breadcrumbs>
        </Box>
    );
}

export default observer(FolderBreadcrumbs);
