import React, { useEffect } from 'react';
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
import useCoreService from '@/stores/app/BaseStateProvider';
import useBookmarksService from '@/stores/app/BookmarksProvider';

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

function Bookmarks({ onScroll }) {
    const classes = useStyles();
    const bookmarksStore = useBookmarksService();
    const store = useLocalObservable(() => ({
        activeFolderId: 1,
        searchRequest: new SearchQuery({ folderId: 1 }),
        draftSearchRequest: {},
        lastScrollEventTime: 0,
        scroll: null,
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

    const wheelHandler = () => {
        const nowScrollEventTime = performance.now();
        const delta = nowScrollEventTime - store.lastScrollEventTime;
        store.lastScrollEventTime = nowScrollEventTime;

        if (store.scroll.scrollerElement.scrollTop === 0) onScroll({ blockTop: delta < 400 });
        else onScroll({ blockTop: true });
    };

    useEffect(() => {
        addEventListener('wheel', wheelHandler, true);

        return () => removeEventListener('wheel', wheelHandler);
    }, []);

    return (
        <Box className={classes.root} display="flex" flexGrow={1}>
            <FoldersPanel
                selectFolderId={store.activeFolderId}
                searchEverywhere={store.draftSearchRequest.searchEverywhere}
                onSelectFolder={(id) => {
                    store.activeFolderId = id;
                    handleResearch(store.searchRequest);
                }}
            />
            <Box flexGrow={1} overflow="auto">
                <Scrollbar refScroll={(scroll) => { store.scroll = scroll; }}>
                    <Box minHeight="100vh" display="flex" flexDirection="column">
                        <ToolsPanel onResearch={handleResearch} />
                        <FolderBreadcrumbs
                            selectFolderId={store.searchRequest.folderId}
                            onSelectFolder={(id) => {
                                store.activeFolderId = id;
                                handleResearch(store.searchRequest);
                            }}
                        />
                        <BookmarksViewer
                            activeFolderId={store.activeFolderId}
                            searchRequest={store.searchRequest}
                        />
                    </Box>
                </Scrollbar>
            </Box>
        </Box>
    );
}

export default observer(Bookmarks);
