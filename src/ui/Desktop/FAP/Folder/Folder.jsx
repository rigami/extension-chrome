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
import { CloseRounded as CloseIcon, FolderRounded as FolderIcon } from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import Scrollbar from '@/ui-components/CustomScroll';
import Stub from '@/ui-components/Stub';
import { useTranslation } from 'react-i18next';
import FoldersUniversalService from '@/stores/universal/bookmarks/folders';
import BookmarksUniversalService from '@/stores/universal/bookmarks/bookmarks';
import clsx from 'clsx';
import BookmarksGrid from '@/ui/Bookmarks/BookmarksGrid';
import FolderCard from '@/ui/Desktop/FAP/Folder/Card';
import { BookmarkAddRounded as AddBookmarkIcon } from '@/icons';
import useCoreService from '@/stores/app/BaseStateProvider';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import { ContextMenuItem } from '@/stores/app/entities/contextMenu';
import useContextMenu from '@/stores/app/ContextMenuProvider';

const useStyles = makeStyles((theme) => ({
    root: {
        width: (theme.shape.dataCard.width + theme.spacing(2)) * 2 + theme.spacing(2) + 1,
        maxWeight: 'inherit',
        borderRadius: 0,
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        transition: theme.transitions.create(['width'], {
            duration: theme.transitions.duration.short,
            easing: theme.transitions.easing.easeInOut,
        }),
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
    const bookmarksService = useBookmarksService();
    const coreService = useCoreService();
    const [folder, setFolder] = useState(null);
    const [isSearching, setIsSearching] = useState(true);
    const [findBookmarks, setFindBookmarks] = useState(null);
    const [folders, setFolders] = useState([]);
    const contextMenu = useContextMenu(() => [
        new ContextMenuItem({
            title: t('bookmark:button.add'),
            icon: AddBookmarkIcon,
            onClick: () => {
                coreService.localEventBus.call('bookmark/create', { defaultFolderId: id });
            },
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

        BookmarksUniversalService.getAllInFolder(id)
            .then((searchResult) => {
                setFindBookmarks(searchResult);
                setIsSearching(load);
                load = false;
            });
    }, [bookmarksService.lastTruthSearchTimestamp]);

    return (
        <Card
            className={clsx(classes.root, shrink && classes.shrink, externalClassName)}
            onClick={() => {
                if (shrink) onBack();
            }}
            onContextMenu={contextMenu}
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
                action={rootFolder && (
                    <Tooltip title={t('common:button.close')}>
                        <IconButton
                            onClick={() => {
                                if (coreService.storage.temp.closeFapPopper) {
                                    coreService.storage.temp.closeFapPopper();
                                }
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Tooltip>
                )}
                title={!shrink && folder?.name}
                classes={{
                    avatar: classes.avatar,
                    action: classes.action,
                }}
            />
            {isSearching && (
                <Stub>
                    <CircularProgress />
                </Stub>
            )}
            {!isSearching && (findBookmarks?.length === 0 && folders?.length === 0) && (
                <Stub message={t('bookmark:empty')}>
                    <Button
                        onClick={() => coreService.localEventBus.call(
                            'bookmark/create',
                            { defaultFolderId: id },
                        )}
                        startIcon={<AddBookmarkIcon />}
                        variant="contained"
                        color="primary"
                    >
                        {t('bookmark:button.add', { context: 'first' })}
                    </Button>
                </Stub>
            )}
            {!isSearching && (folders?.length > 0 || findBookmarks?.length > 0) && (
                <Box
                    display="flex"
                    className={clsx(classes.bookmarks, shrink && classes.notActiveFolder)}
                >
                    <Scrollbar>
                        <Box display="flex" flexWrap="wrap" ml={2}>
                            {folders.map((currFolder) => (
                                <FolderCard
                                    active={openFolderId === currFolder.id}
                                    key={currFolder.id}
                                    id={currFolder.id}
                                    name={currFolder.name}
                                    className={classes.folderCard}
                                    onClick={() => onOpenFolder(currFolder.id)}
                                />
                            ))}
                        </Box>
                        <Box display="flex" ml={2}>
                            <BookmarksGrid
                                bookmarks={findBookmarks}
                                columns={2}
                            />
                        </Box>
                    </Scrollbar>
                </Box>
            )}
        </Card>
    );
}

export default Folder;
