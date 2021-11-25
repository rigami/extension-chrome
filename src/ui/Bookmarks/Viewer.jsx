import React, { useCallback, useEffect } from 'react';
import { Box, Fab, Tooltip } from '@material-ui/core';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { sample } from 'lodash';
import { useResizeDetector } from 'react-resize-detector';
import FoldersPanel from '@/ui/Bookmarks/FoldersPanel';
import BookmarksViewer from '@/ui/Bookmarks/BookmarksViewer';
import ToolsPanel from '@/ui/Bookmarks/ToolsPanel';
import Scrollbar from '@/ui-components/CustomScroll';
import useCoreService from '@/stores/app/BaseStateProvider';
import { ContextMenuItem } from '@/stores/app/entities/contextMenu';
import { BookmarkAddRounded as AddBookmarkIcon } from '@/icons';
import BookmarksSearchService from '@/ui/Bookmarks/BookmarksSearchService';
import FoldersUniversalService from '@/stores/universal/bookmarks/folders';
import useContextMenu from '@/stores/app/ContextMenuProvider';
import GreetingView from '@/ui/Bookmarks/GreetingView';
import { FETCH } from '@/enum';

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
    content: { margin: 'auto' },
    offsetContainer: { width: '100%' },
}));

function Bookmarks() {
    const theme = useTheme();
    const classes = useStyles();
    const { t } = useTranslation(['bookmark']);
    const coreService = useCoreService();
    const service = useLocalObservable(() => new BookmarksSearchService());
    const store = useLocalObservable(() => ({ columnsCount: 0 }));
    const contextMenu = useContextMenu(() => [
        new ContextMenuItem({
            title: t('bookmark:button.add'),
            icon: AddBookmarkIcon,
            onClick: () => {
                coreService.localEventBus.call(
                    'bookmark/create',
                    {
                        defaultFolderId: service.selectFolderId,
                        defaultTagsIds: service.tags,
                    },
                );
            },
        }),
    ]);
    const onResize = useCallback((width) => {
        store.columnsCount = Math.min(
            Math.floor((width + 16 - 32) / (theme.shape.dataCard.width + 16)),
            4,
        );
    }, []);

    const { ref } = useResizeDetector({ onResize });

    useEffect(() => {
        const listenId = coreService.globalEventBus.on('folder/removed', async () => {
            const folder = await FoldersUniversalService.get(service.selectFolderId);

            if (!folder) service.setActiveFolder(1);
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
            <FoldersPanel searchService={service} />
            <Box flexGrow={1} overflow="auto">
                <Scrollbar>
                    <Box
                        minHeight="100vh" display="flex" flexDirection="column"
                        ref={ref}
                    >
                        <ToolsPanel searchService={service} />
                        <Box
                            className={classes.offsetContainer}
                            style={{ maxWidth: (store.columnsCount + 0.5) * (theme.shape.dataCard.width + 16) + 16 }}
                        >
                            <Box
                                className={classes.content}
                                style={{ width: store.columnsCount * (theme.shape.dataCard.width + 16) + 16 }}
                            >
                                {!service.selectFolderId && (
                                    <GreetingView searchService={service} />
                                )}
                                <BookmarksViewer searchService={service} columns={store.columnsCount} />
                            </Box>
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
                        { defaultFolderId: service.selectFolderId },
                    )}
                >
                    <AddBookmarkIcon />
                </Fab>
            </Tooltip>
        </Box>
    );
}

export default observer(Bookmarks);
