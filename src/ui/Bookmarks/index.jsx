import React from 'react';
import { Box } from '@material-ui/core';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import FoldersPanel from '@/ui/Bookmarks/FoldersPanel';
import BookmarksViewer from '@/ui/Bookmarks/BookmarksViewer';
import ToolsPanel from '@/ui/Bookmarks/ToolsPanel';
import FolderBreadcrumbs from '@/ui/Bookmarks/FolderBreadcrumbs';
import Scrollbar from '@/ui-components/CustomScroll';
import { SearchQuery } from '@/stores/universal/bookmarks/bookmarks';
import { debounce } from 'lodash';

const useStyles = makeStyles((theme) => ({
    root: {},
    chipContainer: { },
    container: {
        paddingTop: theme.spacing(3),
        height: '100%',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
    },
    fadeWrapper: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: theme.spacing(3),
    },
}));

function Bookmarks() {
    const classes = useStyles();
    const store = useLocalObservable(() => ({
        activeFolderId: 1,
        searchRequest: new SearchQuery({ folderId: 1 }),
        draftSearchRequest: {},
    }));

    const search = debounce(() => {
        store.searchRequest = new SearchQuery({
            ...store.draftSearchRequest,
            folderId: !store.draftSearchRequest.searchEverywhere ? store.activeFolderId : false,
        });
    }, 400);

    const handleResearch = (searchRequest) => {
        store.draftSearchRequest = {
            ...store.draftSearchRequest,
            ...searchRequest,
        };

        search();
    };

    return (
        <Box className={classes.root} display="flex" flexGrow={1}>
            <FoldersPanel
                selectFolderId={store.activeFolderId}
                onSelectFolder={(id) => {
                    store.activeFolderId = id;
                    handleResearch(store.searchRequest);
                }}
            />
            <Box flexGrow={1} overflow="auto">
                <Scrollbar>
                    <Box minHeight="100vh" display="flex" flexDirection="column">
                        <ToolsPanel onResearch={handleResearch} />
                        <FolderBreadcrumbs
                            selectFolderId={store.searchRequest.folderId}
                            onSelectFolder={(id) => {
                                store.activeFolderId = id;
                                handleResearch(store.searchRequest);
                            }}
                        />
                        <BookmarksViewer searchRequest={store.searchRequest} />
                    </Box>
                </Scrollbar>
            </Box>
        </Box>
    );
}

export default observer(Bookmarks);
