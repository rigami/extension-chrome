import React, { useState, useEffect } from 'react';
import {
    Card,
    CardHeader,
    CircularProgress,
    IconButton,
    Tooltip,
    Box,
    Button,
} from '@material-ui/core';
import {
    CloseRounded as CloseIcon,
    FolderRounded as FolderIcon,
    ArrowBackRounded as BackIcon, CreateNewFolderRounded as AddNewFolderIcon,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import Scrollbar from '@/ui-components/CustomScroll';
import Stub from '@/ui-components/Stub';
import FoldersUniversalService from '@/stores/universal/workingSpace/folders';
import BookmarksGrid from '@/ui/WorkingSpace/BookmarksViewer/BookmarksGrid';
import FolderCard from '@/ui/Desktop/FAP/Folder/Card';
import { BookmarkAddRounded as AddBookmarkIcon } from '@/icons';
import { useCoreService } from '@/stores/app/core';
import { useWorkingSpaceService } from '@/stores/app/workingSpace';
import { ContextMenuItem } from '@/stores/app/contextMenu/entities';
import { useContextMenuService } from '@/stores/app/contextMenu';
import { useContextEdit } from '@/stores/app/contextActions';
import { search, SearchQuery } from '@/stores/universal/workingSpace/search';
import { BKMS_DISPLAY_VARIANT } from '@/enum';
import BookmarksList from '@/ui/WorkingSpace/BookmarksViewer/BookmarksList';
import sorting from '@/ui/WorkingSpace/BookmarksViewer/utils/sort';

const useStyles = makeStyles((theme) => ({
    root: {
        width: (theme.shape.dataCard.width + theme.spacing(2)) * 2 + theme.spacing(2) + 1,
        maxWeight: 'inherit',
        borderRadius: 0,
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: 'none',
    },
    avatar: {
        display: 'flex',
        height: theme.spacing(4),
        alignItems: 'center',
    },
    bookmarks: {
        overflow: 'auto',
        flexGrow: 1,
        width: (theme.shape.dataCard.width + theme.spacing(2)) * 2 + theme.spacing(2) + 1,
    },
    primaryText: {
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    },
    secondaryText: {
        display: '-webkit-box',
        '-webkit-box-orient': 'vertical',
        '-webkit-line-clamp': 2,
        overflow: 'hidden',
        wordBreak: 'break-word',
    },
    resetOffsetButton: {
        margin: theme.spacing(-1.5),
        marginLeft: theme.spacing(-0.5),
    },
    shrink: {
        width: 72,
        zIndex: 0,
        cursor: 'pointer',
        '&:hover $notActiveFolder': { opacity: 1 },
    },
    folderCard: {
        marginRight: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    action: { marginBottom: theme.spacing(-1) },
    notActiveFolder: {
        opacity: 0.5,
        pointerEvents: 'none',
    },
    titleContent: { overflow: 'auto' },
    title: {
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        fontFamily: theme.typography.specialFontFamily,
    },
    scrollContent: {
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
    },
    listBookmarks: {
        width: '100%',
        margin: theme.spacing(0, -1),
    },
}));

function Folder(props) {
    const {
        id,
        openFolderId,
        rootFolder = false,
        shrink = false,
        className: externalClassName,
        onOpenFolder,
        onBack,
    } = props;
    const classes = useStyles();
    const { t } = useTranslation(['folder', 'bookmark']);
    const workingSpaceService = useWorkingSpaceService();
    const coreService = useCoreService();
    const [folder, setFolder] = useState(null);
    const [isSearching, setIsSearching] = useState(true);
    const [findBookmarks, setFindBookmarks] = useState(null);
    const [folders, setFolders] = useState([]);
    const { dispatchEdit } = useContextEdit();
    const { dispatchContextMenu } = useContextMenuService((event, position, next) => [
        new ContextMenuItem({
            title: t('bookmark:button.add'),
            icon: AddBookmarkIcon,
            onClick: () => dispatchEdit({
                itemType: 'bookmark',
                defaultFolderId: id,
            }, event, position, next),
        }),
        new ContextMenuItem({
            title: t('folder:button.create'),
            icon: AddNewFolderIcon,
            onClick: () => dispatchEdit({
                itemType: 'folder',
                parentId: id,
            }, event, position, next),
        }),
    ]);

    useEffect(() => {
        setIsSearching(true);
        FoldersUniversalService.get(id).then((findFolder) => setFolder(findFolder));
        let load = true;

        FoldersUniversalService.getFoldersByParent(id)
            .then((foundFolders) => {
                setFolders(foundFolders);
                setIsSearching(load);
                load = false;
            });

        const sort = sorting[workingSpaceService.settings.sorting](workingSpaceService);

        search(new SearchQuery(({ folderId: id })))
            .then((result) => {
                setFindBookmarks((result.all && sort(result.all)) || []);
                setIsSearching(load);
                load = false;
            });
    }, [workingSpaceService.lastTruthSearchTimestamp]);

    return (
        <Card
            className={clsx(classes.root, shrink && classes.shrink, externalClassName)}
            onClick={() => {
                if (shrink) onBack();
            }}
            onContextMenu={dispatchContextMenu}
            elevation={0}
        >
            <CardHeader
                avatar={(
                    shrink ? (
                        <Tooltip title={folder?.name}>
                            <IconButton
                                disabled={rootFolder}
                                onClick={onBack}
                                className={classes.resetOffsetButton}
                            >
                                <FolderIcon />
                            </IconButton>
                        </Tooltip>
                    ) : (
                        <IconButton
                            disabled={rootFolder}
                            onClick={onBack}
                            className={classes.resetOffsetButton}
                        >
                            <FolderIcon />
                        </IconButton>
                    )

                )}
                action={rootFolder ? (
                    <Tooltip title={t('common:button.close')}>
                        <IconButton
                            onClick={() => {
                                if (coreService.tempStorage.data.closeFapPopper) {
                                    coreService.tempStorage.data.closeFapPopper();
                                }
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Tooltip>
                ) : (
                    <Tooltip title={t('common:button.back')}>
                        <IconButton
                            onClick={() => {
                                onBack();
                            }}
                        >
                            <BackIcon />
                        </IconButton>
                    </Tooltip>
                )}
                title={!shrink && folder?.name}
                classes={{
                    avatar: classes.avatar,
                    action: classes.action,
                    content: classes.titleContent,
                    title: classes.title,
                }}
            />
            {isSearching && (
                <Stub>
                    <CircularProgress />
                </Stub>
            )}
            {!isSearching && (
                <Box
                    display="flex"
                    className={clsx(classes.bookmarks, shrink && classes.notActiveFolder)}
                >
                    <Scrollbar classes={{ content: classes.scrollContent }}>
                        {folders.length > 0 && (
                            <Box display="flex" flexWrap="wrap" ml={2}>
                                {folders.map((currFolder) => (
                                    <FolderCard
                                        active={openFolderId === currFolder.id}
                                        key={currFolder.id}
                                        id={currFolder.id}
                                        name={currFolder.name}
                                        className={classes.folderCard}
                                        onClick={() => {
                                            if (openFolderId === currFolder.id) {
                                                onBack();
                                            } else {
                                                onOpenFolder(currFolder.id);
                                            }
                                        }}
                                    />
                                ))}
                            </Box>
                        )}
                        {findBookmarks.length > 0 && (
                            <Box display="flex" ml={2} mb={2}>
                                {workingSpaceService.settings.displayVariant === BKMS_DISPLAY_VARIANT.CARDS && (
                                    <BookmarksGrid
                                        bookmarks={findBookmarks}
                                        columns={2}
                                    />
                                )}
                                {workingSpaceService.settings.displayVariant === BKMS_DISPLAY_VARIANT.ROWS && (
                                    <BookmarksList
                                        bookmarks={findBookmarks}
                                        className={classes.listBookmarks}
                                    />
                                )}
                            </Box>
                        )}
                        {(findBookmarks?.length === 0) && (
                            <Stub message={t('bookmark:empty')}>
                                <Button
                                    onClick={(event) => dispatchEdit({
                                        itemType: 'bookmark',
                                        defaultFolderId: id,
                                    }, event)}
                                    startIcon={<AddBookmarkIcon />}
                                    variant="contained"
                                    color="primary"
                                >
                                    {t('bookmark:button.add', { context: 'first' })}
                                </Button>
                            </Stub>
                        )}
                    </Scrollbar>
                </Box>
            )}
        </Card>
    );
}

export default Folder;
