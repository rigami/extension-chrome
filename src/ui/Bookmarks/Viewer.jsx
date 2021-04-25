import React, { useEffect } from 'react';
import { Box } from '@material-ui/core';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import FoldersPanel from '@/ui/Bookmarks/FoldersPanel';
import BookmarksViewer from '@/ui/Bookmarks/BookmarksViewer';
import ToolsPanel from '@/ui/Bookmarks/ToolsPanel';
import Scrollbar from '@/ui-components/CustomScroll';
import useCoreService from '@/stores/app/BaseStateProvider';
import { ContextMenuItem } from '@/stores/app/entities/contextMenu';
import { BookmarkAddRounded as AddBookmarkIcon } from '@/icons';
import { useTranslation } from 'react-i18next';
import BookmarksSearchService from '@/ui/Bookmarks/BookmarksSearchService';
import FoldersUniversalService from '@/stores/universal/bookmarks/folders';
import useContextMenu from '@/stores/app/ContextMenuProvider';

const useStyles = makeStyles((theme) => ({
    root: {
        height: '100vh',
        width: '100vw',
        backgroundColor: theme.palette.background.paper,
        transform: 'translate3d(0,0,0)',
        display: 'flex',
        flexDirection: 'row',
    },
}));

function Bookmarks() {
    const classes = useStyles();
    const { t } = useTranslation(['bookmark']);
    const coreService = useCoreService();
    const service = useLocalObservable(() => new BookmarksSearchService());
    const contextMenu = useContextMenu(() => [
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
    ]);

    useEffect(() => {
        const listenId = coreService.globalEventBus.on('folder/removed', async () => {
            const folder = await FoldersUniversalService.get(service.activeFolderId);

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
