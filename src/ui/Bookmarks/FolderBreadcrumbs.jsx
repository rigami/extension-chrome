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

function FolderBreadcrumbs({ searchService: service }) {
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
        <Box px={2} visibility={service.searchEverywhere ? 'hidden' : 'visible'}>
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
