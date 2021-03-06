import React, { useState, useEffect, useRef } from 'react';
import {
    Card,
    CardHeader,
    List,
    CircularProgress,
    IconButton,
    ListItemAvatar,
    ListItemText,
    ListItem,
    Avatar,
    Tooltip,
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
import Link from '@/ui/Bookmarks/FAP/Link';
import FoldersUniversalService from '@/stores/universal/bookmarks/folders';
import BookmarksUniversalService from '@/stores/universal/bookmarks/bookmarks';
import clsx from 'clsx';
import useAppService from '@/stores/app/AppStateProvider';
import pin from '@/utils/contextMenu/pin';
import edit from '@/utils/contextMenu/edit';
import remove from '@/utils/contextMenu/remove';

const useStyles = makeStyles((theme) => ({
    root: {
        width: 450,
        borderRadius: 0,
        transition: theme.transitions.create(['width'], {
            duration: theme.transitions.duration.short,
            easing: theme.transitions.easing.easeInOut,
        }),
        zIndex: 1,
    },
    avatar: { display: 'flex' },
    list: {
        height: 550,
        overflow: 'auto',
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

        FoldersUniversalService.getFoldersByParent(id)
            .then((foundFolders) => {
                setFolders(foundFolders);
            });

        BookmarksUniversalService.getAllInFolder(id)
            .then((searchResult) => {
                setFindBookmarks(searchResult);
                setIsSearching(false);
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
            <List disablePadding className={classes.list}>
                <Scrollbar>
                    {isSearching && (
                        <FullScreenStub style={{ height: 550 }}>
                            <CircularProgress />
                        </FullScreenStub>
                    )}
                    {!isSearching && (findBookmarks.length === 0 && folders.length === 0) && (
                        <FullScreenStub
                            style={{ height: 550 }}
                            message={t('fap.folder.emptyTitle')}
                            description={t('fap.folder.emptyDescription')}
                        />
                    )}
                    {folders && folders.map((currFolder, index) => (
                        <Tooltip key={currFolder.id} title={currFolder.name}>
                            <ListItem
                                button
                                className={classes.row}
                                divider={index !== folders.length - 1}
                                onClick={() => onOpenFolder(currFolder.id)}
                                selected={openFolderId === currFolder.id}
                            >
                                <ListItemAvatar>
                                    <Avatar>
                                        <FolderIcon />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={currFolder.name}
                                    classes={{
                                        primary: classes.primaryText,
                                        secondary: classes.secondaryText,
                                    }}
                                />
                            </ListItem>
                        </Tooltip>
                    ))}
                    {findBookmarks && findBookmarks.map((bookmark, index) => (
                        <Link
                            key={bookmark.id}
                            {...bookmark}
                            variant="row"
                            divider={index !== findBookmarks.length - 1}
                        />
                    ))}
                </Scrollbar>
            </List>
        </Card>
    );
}

export default Folder;
