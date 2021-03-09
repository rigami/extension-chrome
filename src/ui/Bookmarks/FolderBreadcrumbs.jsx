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

function FolderBreadcrumbs({ selectFolderId, onSelectFolder }) {
    const store = useLocalObservable(() => ({
        path: null,
        pathState: FETCH.WAIT,
    }));

    useEffect(() => {
        if (selectFolderId === null) {
            store.path = null;
            store.pathState = FETCH.WAIT;
            return;
        }

        store.pathState = FETCH.PENDING;

        FoldersUniversalService.getPath(selectFolderId)
            .then((path) => {
                store.path = path;
                store.pathState = FETCH.DONE;
            });
    }, [selectFolderId]);

    return (
        <Box px={4} visibility={selectFolderId === 1 ? 'hidden' : 'unset'}>
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
                            onSelectFolder(folder.id);
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
