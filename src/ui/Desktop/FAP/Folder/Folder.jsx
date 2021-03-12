import React, { useState, useEffect, useRef } from 'react';
import {
    Card,
    CardHeader,
    CircularProgress,
    IconButton,
    Tooltip,
    Box,
} from '@material-ui/core';
import {
    FolderRounded as FolderIcon,
    MoreVertRounded as MoreIcon,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import useCoreService from '@/stores/app/BaseStateProvider';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import Scrollbar from '@/ui-components/CustomScroll';
import FullScreenStub from '@/ui-components/FullscreenStub';
import { useTranslation } from 'react-i18next';
import FoldersUniversalService from '@/stores/universal/bookmarks/folders';
import BookmarksUniversalService from '@/stores/universal/bookmarks/bookmarks';
import clsx from 'clsx';
import useAppService from '@/stores/app/AppStateProvider';
import pin from '@/utils/contextMenu/pin';
import edit from '@/utils/contextMenu/edit';
import remove from '@/utils/contextMenu/remove';
import BookmarksGrid from '@/ui/Bookmarks/BookmarksGrid';
import FolderCard from '@/ui/Bookmarks/Folders/Card';

const useStyles = makeStyles((theme) => ({
    root: {
        width: 409,
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
    avatar: { display: 'flex' },
    bookmarks: {
        overflow: 'auto',
        flexGrow: 1,
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
    },
    folderCard: {
        marginRight: theme.spacing(2),
        marginBottom: theme.spacing(2),
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
    const { t } = useTranslation();
    const appService = useAppService();
    const bookmarksService = useBookmarksService();
    const coreService = useCoreService();
    const [folder, setFolder] = useState(null);
    const [isSearching, setIsSearching] = useState(true);
    const [findBookmarks, setFindBookmarks] = useState(null);
    const [folders, setFolders] = useState([]);
    const buttonRef = useRef(null);

    const contextMenu = (event) => [
        pin({
            itemId: id,
            itemType: 'folder',
            t,
            bookmarksService,
        }),
        ...(folder.parentId !== 0 ? [
            edit({
                itemId: id,
                itemType: 'folder',
                t,
                coreService,
                anchorEl: event.currentTarget,
            }),
            remove({
                itemId: id,
                itemType: 'folder',
                t,
                coreService,
            }),
        ] : []),
    ];

    useEffect(() => {
        FoldersUniversalService.get(id).then((findFolder) => setFolder(findFolder));
        let load = true;

        FoldersUniversalService.getFoldersByParent(id)
            .then((foundFolders) => {
                console.log('foundFolders:', foundFolders, load);
                setFolders(foundFolders);
                setIsSearching(load);
                load = false;
            });

        BookmarksUniversalService.getAllInFolder(id)
            .then((searchResult) => {
                console.log('searchResult:', searchResult, load);
                setFindBookmarks(searchResult);
                setIsSearching(load);
                load = false;
            });
    }, []);

    return (
        <Card className={clsx(classes.root, shrink && classes.shrink, externalClassName)}>
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
                title={!shrink && folder?.name}
                classes={{ avatar: classes.avatar }}
                action={(
                    <IconButton
                        data-ui-path="folder.explorer.menu"
                        onClick={appService.contextMenu(contextMenu, { useAnchorEl: true })}
                        ref={buttonRef}
                    >
                        <MoreIcon />
                    </IconButton>
                )}
            />
            {isSearching && (
                <FullScreenStub style={{ height: 550 }}>
                    <CircularProgress />
                </FullScreenStub>
            )}
            {!isSearching && (findBookmarks?.length === 0 && folders?.length === 0) && (
                <FullScreenStub
                    style={{ height: 550 }}
                    message={t('fap.folder.emptyTitle')}
                    description={t('fap.folder.emptyDescription')}
                />
            )}
            {folders?.length > 0 && findBookmarks?.length > 0 && (
                <Box display="flex" className={classes.bookmarks}>
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
