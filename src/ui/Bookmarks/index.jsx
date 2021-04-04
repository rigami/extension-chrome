import React, { useEffect } from 'react';
import { Box } from '@material-ui/core';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import FoldersPanel from '@/ui/Bookmarks/FoldersPanel';
import BookmarksViewer from '@/ui/Bookmarks/BookmarksViewer';
import ToolsPanel from '@/ui/Bookmarks/ToolsPanel';
import FolderBreadcrumbs from '@/ui/Bookmarks/FolderBreadcrumbs';
import Scrollbar from '@/ui-components/CustomScroll';
import { SearchQuery } from '@/stores/universal/bookmarks/searchQuery';
import useCoreService from '@/stores/app/BaseStateProvider';
import useAppService from '@/stores/app/AppStateProvider';
import { ContextMenuItem } from '@/stores/app/entities/contextMenu';
import { BookmarkAddRounded as AddBookmarkIcon } from '@/icons';
import { useTranslation } from 'react-i18next';
import BookmarksSearchService from '@/ui/Bookmarks/BookmarksSearchService';
import { ACTIVITY } from '@/enum';

const useStyles = makeStyles((theme) => ({
    root: {
        height: '100vh',
        width: '100vw',
        backgroundColor: theme.palette.background.paper,
        transform: 'translate3d(0,0,0)',
        display: 'flex',
        flexDirection: 'row',
    },
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
    const { t } = useTranslation(['bookmark']);
    const coreService = useCoreService();
    const appService = useAppService();
    const service = useLocalObservable(() => new BookmarksSearchService());
    const store = useLocalObservable(() => ({
        searchRequest: new SearchQuery({ folderId: 1 }),
        draftSearchRequest: {},
        lastScrollEventTime: 0,
        scroll: null,
        isRender: appService.activity === ACTIVITY.BOOKMARKS,
    }));

    const contextMenu = () => [
        new ContextMenuItem({
            title: t('bookmark:button.add'),
            icon: AddBookmarkIcon,
            onClick: () => {
                coreService.localEventBus.call(
                    'bookmark/create',
                    {
                        defaultFolderId: service.activeFolderId,
                        defaultTagsIds: service.tags,
                    },
                );
            },
        }),
    ];

    const wheelHandler = () => {
        if (!store.scroll?.scrollerElement) return;
        const nowScrollEventTime = performance.now();
        const delta = nowScrollEventTime - store.lastScrollEventTime;
        store.lastScrollEventTime = nowScrollEventTime;
    };

    useEffect(() => {
        if (appService.activity === ACTIVITY.BOOKMARKS) {
            addEventListener('wheel', wheelHandler, true);
            store.isRender = true;
        }

        return () => {
            if (appService.activity === ACTIVITY.BOOKMARKS) removeEventListener('wheel', wheelHandler);
        };
    }, [appService.activity]);

    if (!store.isRender) {
        return null;
    }

    return (
        <Box
            className={classes.root}
            display="flex"
            flexGrow={1}
            onContextMenu={appService.contextMenu(contextMenu)}
        >
            <FoldersPanel searchService={service} />
            <Box flexGrow={1} overflow="auto">
                <Scrollbar refScroll={(scroll) => { store.scroll = scroll; }}>
                    <Box minHeight="100vh" display="flex" flexDirection="column">
                        <ToolsPanel searchService={service} />
                        <BookmarksViewer searchService={service} />
                    </Box>
                </Scrollbar>
            </Box>
        </Box>
    );
}

export default observer(Bookmarks);
