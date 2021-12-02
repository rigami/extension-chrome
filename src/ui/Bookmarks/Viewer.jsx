import React, { useCallback, useEffect } from 'react';
import { Box, Fab, Tooltip } from '@material-ui/core';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { useResizeDetector } from 'react-resize-detector';
import FoldersPanel from '@/ui/Bookmarks/FoldersPanel';
import ToolsPanel from '@/ui/Bookmarks/ToolsPanel';
import Scrollbar from '@/ui-components/CustomScroll';
import useCoreService from '@/stores/app/BaseStateProvider';
import { ContextMenuItem } from '@/stores/app/entities/contextMenu';
import { BookmarkAddRounded as AddBookmarkIcon } from '@/icons';
import FoldersUniversalService from '@/stores/universal/bookmarks/folders';
import useContextMenu from '@/stores/app/ContextMenuProvider';
import PrimaryContent from '@/ui/Bookmarks/PrimaryContent';
import SecondaryContent from '@/ui/Bookmarks/SecondaryContent';
import { NULL_UUID } from '@/utils/generate/uuid';
import { SearchServiceProvider, useSearchService } from '@/ui/Bookmarks/searchProvider';

const useStyles = makeStyles((theme) => ({
    root: {
        height: '100vh',
        width: '100vw',
        backgroundColor: theme.palette.background.paper,
        transform: 'translate3d(0,0,0)',
        display: 'flex',
        flexDirection: 'row',
    },
    fab: {
        position: 'absolute',
        bottom: theme.spacing(3),
        right: theme.spacing(3),
        backgroundImage: `linear-gradient(to top, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
        '&:hover': { backgroundImage: `linear-gradient(to top, ${theme.palette.primary.dark}, ${theme.palette.primary.main})` },
    },
    content: {
        padding: theme.spacing(0, 3),
        paddingBottom: theme.spacing(12),
    },
    offsetContainer: { width: '100%' },
}));

function Bookmarks() {
    const theme = useTheme();
    const classes = useStyles();
    const { t } = useTranslation(['bookmark']);
    const coreService = useCoreService();
    const searchService = useSearchService();
    const store = useLocalObservable(() => ({ columnsCount: 0 }));
    const contextMenu = useContextMenu(() => [
        new ContextMenuItem({
            title: t('bookmark:button.add'),
            icon: AddBookmarkIcon,
            onClick: () => {
                coreService.localEventBus.call(
                    'bookmark/create',
                    {
                        defaultFolderId: searchService.selectFolderId,
                        defaultTagsIds: searchService.tags,
                    },
                );
            },
        }),
    ]);
    const onResize = useCallback((width) => {
        store.columnsCount = Math.min(
            Math.floor((width + 16 - 48) / (theme.shape.dataCard.width + 16)),
            4,
        );
    }, []);

    const { ref } = useResizeDetector({ onResize });

    useEffect(() => {
        const listenId = coreService.globalEventBus.on('folder/removed', async () => {
            const folder = await FoldersUniversalService.get(searchService.selectFolderId);

            if (!folder) searchService.setSelectFolder(NULL_UUID);
        });

        return () => coreService.globalEventBus.removeListener(listenId);
    }, []);

    return (
        <Box
            className={classes.root}
            display="flex"
            flexGrow={1}
            onContextMenu={contextMenu}
        >
            <FoldersPanel />
            <Box flexGrow={1} overflow="auto">
                <Scrollbar>
                    <Box
                        minHeight="100vh" display="flex" flexDirection="column"
                        ref={ref}
                    >
                        <ToolsPanel />
                        <Box className={classes.content}>
                            <PrimaryContent columns={store.columnsCount} />
                            <SecondaryContent columns={store.columnsCount} />
                        </Box>
                    </Box>
                </Scrollbar>
            </Box>
            <Tooltip title={t('bookmark:button.add', { context: 'short' })} placement="left">
                <Fab
                    className={classes.fab}
                    color="primary"
                    onClick={() => coreService.localEventBus.call(
                        'bookmark/create',
                        { defaultFolderId: searchService.selectFolderId },
                    )}
                >
                    <AddBookmarkIcon />
                </Fab>
            </Tooltip>
        </Box>
    );
}

const ObserverBookmarks = observer(Bookmarks);

function RootBookmark() {
    return (
        <SearchServiceProvider>
            <ObserverBookmarks />
        </SearchServiceProvider>
    );
}

export default RootBookmark;
