import React, { useCallback, useEffect } from 'react';
import { Box, Fab } from '@material-ui/core';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { useResizeDetector } from 'react-resize-detector';
import { CreateNewFolderRounded as AddNewFolderIcon } from '@material-ui/icons';
import SidePanel from '@/ui/WorkingSpace/SidePanel';
import ToolsPanel from '@/ui/WorkingSpace/ToolsPanel';
import Scrollbar from '@/ui-components/CustomScroll';
import { useCoreService } from '@/stores/app/core';
import { ContextMenuItem } from '@/stores/app/contextMenu/entities';
import { BookmarkAddRounded as AddBookmarkIcon } from '@/icons';
import FoldersUniversalService from '@/stores/universal/bookmarks/folders';
import { useContextMenuService } from '@/stores/app/contextMenu';
import PrimaryContent from '@/ui/WorkingSpace/PrimaryContent';
import SecondaryContent from '@/ui/WorkingSpace/SecondaryContent';
import { NULL_UUID } from '@/utils/generate/uuid';
import { SearchServiceProvider, useSearchService } from '@/ui/WorkingSpace/searchProvider';
import GreetingView from '@/ui/WorkingSpace/GreetingView';
import { APP_STATE } from '@/stores/app/core/service';
import FirstLookScreen from '@/ui/WorkingSpace/FirstLookScreen';
import { useContextEdit } from '@/stores/app/contextActions';

const useStyles = makeStyles((theme) => ({
    root: {
        height: '100vh',
        width: '100vw',
        transform: 'translate3d(0,0,0)',
        display: 'flex',
        flexDirection: 'row',
    },
    fab: {
        borderRadius: 18,
        position: 'absolute',
        bottom: theme.spacing(3),
        right: theme.spacing(3),
        backgroundColor: '#242424',
        textTransform: 'none',
        '&:hover': { backgroundColor: '#000000' },
        '& svg': { marginRight: theme.spacing(1) },
    },
    container: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    content: {
        width: '100%',
        padding: theme.spacing(4, 3),
        paddingBottom: theme.spacing(12),
    },
    '@media (max-width: 1400px)': { content: { padding: theme.spacing(4, 0) } },
    sideBar: {
        position: 'sticky',
        top: 68,
        flexGrow: 1,
        maxWidth: 450,
        marginLeft: 'auto',
        flexBasis: '100%',
        paddingTop: theme.spacing(7),
        paddingRight: theme.spacing(3),
    },
    // '@media (max-width: 1700px)': { sideBar: { maxWidth: 360 } },
    inlineWidgets: {
        marginBottom: theme.spacing(4),
        padding: theme.spacing(0, 2),
    },
}));

function Bookmarks() {
    const theme = useTheme();
    const classes = useStyles();
    const { t } = useTranslation(['bookmark']);
    const coreService = useCoreService();
    const searchService = useSearchService();
    const store = useLocalObservable(() => ({
        width: 0,
        columnsCount: 0,
        maxColumnsCount: 0,
    }));
    const { dispatchEdit } = useContextEdit();
    const { dispatchContextMenu } = useContextMenuService((event, position, next) => [
        new ContextMenuItem({
            title: t('bookmark:button.add'),
            icon: AddBookmarkIcon,
            onClick: () => dispatchEdit({
                itemType: 'bookmark',
                defaultFolderId: searchService.selectFolderId,
                defaultTagsIds: searchService.tags,
            }, event, position, next),
        }),
        new ContextMenuItem({
            title: t('folder:button.create'),
            icon: AddNewFolderIcon,
            onClick: () => dispatchEdit({
                itemType: 'folder',
                parentId: searchService.selectFolderId,
            }, event, position, next),
        }),
    ]);

    const onResize = useCallback((width) => {
        store.width = width;
        store.maxColumnsCount = Math.floor((width - 48 - 32 + 16) / (theme.shape.dataCard.width + 16));
        console.log('width:', width - 32 - 48 + 16, (width - 48 - 32 + 16) / (theme.shape.dataCard.width + 16));
        store.columnsCount = Math.max(
            Math.min(
                store.maxColumnsCount >= 4 && searchService.selectFolderId === NULL_UUID
                    ? store.maxColumnsCount - 1
                    : store.maxColumnsCount,
                4,
            ),
            1,
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

    useEffect(() => {
        if (store.width) onResize(store.width);
    }, [searchService.selectFolderId]);

    return (
        <Box
            className={classes.root}
            display="flex"
            flexGrow={1}
            onContextMenu={(event) => dispatchContextMenu(event)}
        >
            <SidePanel />
            <Box flexGrow={1} overflow="auto" ref={ref}>
                <Scrollbar>
                    <ToolsPanel />
                    <Box className={classes.container}>
                        <Box className={classes.content}>
                            <PrimaryContent columns={store.columnsCount} />
                            {store.maxColumnsCount < 4 && searchService.selectFolderId === NULL_UUID && (
                                <Box className={classes.inlineWidgets}>
                                    <GreetingView />
                                </Box>
                            )}
                            {coreService.appState === APP_STATE.REQUIRE_SETUP && (
                                <FirstLookScreen
                                    style={{ maxWidth: store.columnsCount * (theme.shape.dataCard.width + 16) + 16 }}
                                    onStart={() => { console.log('done'); }}
                                />
                            )}
                            {
                                !searchService.searchRequest.usedFields.query
                                && !searchService.searchRequest.usedFields.tags
                                && coreService.appState !== APP_STATE.REQUIRE_SETUP
                                && (
                                    <SecondaryContent columns={store.columnsCount} />
                                )
                            }
                        </Box>
                        {store.maxColumnsCount >= 4 && searchService.selectFolderId === NULL_UUID && (
                            <Box className={classes.sideBar}>
                                <GreetingView />
                            </Box>
                        )}
                    </Box>
                </Scrollbar>
            </Box>
            <Fab
                variant="extended"
                className={classes.fab}
                color="primary"
                onClick={(event) => dispatchEdit({
                    itemType: 'bookmark',
                    defaultFolderId: searchService.selectFolderId,
                }, event)}
            >
                <AddBookmarkIcon />
                {t('bookmark:button.add', { context: 'short' })}
            </Fab>
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
