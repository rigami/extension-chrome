import React, { useEffect } from 'react';
import { Box, CircularProgress } from '@material-ui/core';
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
import useAppService from '@/stores/app/AppStateProvider';
import { ContextMenuDivider, ContextMenuItem } from '@/stores/app/entities/contextMenu';
import { BookmarkAddRounded as AddBookmarkIcon } from '@/icons';
import { BG_SELECT_MODE, BG_SHOW_STATE, BG_SOURCE } from '@/enum';
import {
    AddPhotoAlternateRounded as UploadFromComputerIcon,
    CheckRounded as SavedBgIcon, OpenInNewRounded as OpenSourceIcon,
    RefreshRounded as RefreshIcon, SaveAltRounded as SaveBgIcon,
} from '@material-ui/icons';
import { eventToBackground } from '@/stores/server/bus';
import BackgroundsUniversalService from '@/stores/universal/backgrounds/service';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation(['bookmark']);
    const coreService = useCoreService();
    const appService = useAppService();
    const store = useLocalObservable(() => ({
        activeFolderId: 1,
        searchRequest: new SearchQuery({ folderId: 1 }),
        draftSearchRequest: {},
        lastScrollEventTime: 0,
        scroll: null,
    }));

    const contextMenu = () => [
        new ContextMenuItem({
            title: t('bookmark:button.add'),
            icon: AddBookmarkIcon,
            onClick: () => {
                coreService.localEventBus.call(
                    'bookmark/create',
                    {
                        defaultFolderId: store.searchRequest.folderId,
                        defaultTagsIds: store.searchRequest.tags,
                    },
                );
            },
        }),
    ];

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
        <Box
            className={classes.root} display="flex" flexGrow={1}
            onContextMenu={appService.contextMenu(contextMenu)}
        >
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
