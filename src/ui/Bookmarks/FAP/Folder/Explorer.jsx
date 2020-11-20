import React, { useState, useEffect, useRef } from 'react';
import {
    Card,
    CardHeader,
    List,
    CircularProgress,
    IconButton,
} from '@material-ui/core';
import {
    FolderRounded as FolderIcon,
    BookmarkBorderRounded as PinnedFavoriteIcon,
    BookmarkRounded as UnpinnedFavoriteIcon,
    EditRounded as EditIcon,
    DeleteRounded as RemoveIcon,
    MoreVertRounded as MoreIcon,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { fade } from '@material-ui/core/styles/colorManipulator';
import useCoreService from '@/stores/BaseStateProvider';
import useBookmarksService from '@/stores/BookmarksProvider';
import Scrollbar from '@/ui-components/CustomScroll';
import FullScreenStub from '@/ui-components/FullscreenStub';
import { useTranslation } from 'react-i18next';
import Link from '@/ui/Bookmarks/FAP/Link';
import FolderButton from './index';

const useStyles = makeStyles((theme) => ({
    root: {
        width: 310,
        backdropFilter: 'blur(15px) brightness(130%)',
        backgroundColor: fade(theme.palette.background.default, 0.70),
    },
    avatar: { display: 'flex' },
    list: {
        height: 300,
        overflow: 'auto',
    },
    primaryText: {
        display: '-webkit-box',
        '-webkit-box-orient': 'vertical',
        '-webkit-line-clamp': 2,
        overflow: 'hidden',
        wordBreak: 'break-word',
    },
    secondaryText: {
        display: '-webkit-box',
        '-webkit-box-orient': 'vertical',
        '-webkit-line-clamp': 2,
        overflow: 'hidden',
        wordBreak: 'break-word',
    },
}));

function Folder({ id }) {
    const classes = useStyles();
    const { t } = useTranslation();
    const bookmarksService = useBookmarksService();
    const coreService = useCoreService();
    const [folder, setFolder] = useState(null);
    const [isSearching, setIsSearching] = useState(true);
    const [findBookmarks, setFindBookmarks] = useState(null);
    const [folders, setFolders] = useState([]);
    const buttonRef = useRef(null);

    const isPin = () => bookmarksService.favorites.find((fav) => fav.type === 'folder' && fav.id === id);

    const handlerContextMenu = (anchorEl) => {
        const { top, left } = buttonRef.current.getBoundingClientRect();
        coreService.localEventBus.call('system/contextMenu', {
            actions: [
                {
                    type: 'button',
                    title: isPin() ? t('fap.unpin') : t('fap.pin'),
                    icon: isPin() ? UnpinnedFavoriteIcon : PinnedFavoriteIcon,
                    onClick: () => {
                        if (isPin()) {
                            bookmarksService.removeFromFavorites({
                                type: 'folder',
                                id,
                            });
                        } else {
                            bookmarksService.addToFavorites({
                                type: 'folder',
                                id,
                            });
                        }
                    },
                },
                ...(folder.parentId !== 0 ? [
                    {
                        type: 'button',
                        title: t('edit'),
                        icon: EditIcon,
                        onClick: () => {
                            coreService.localEventBus.call('folder/edit', {
                                id,
                                anchorEl,
                            });
                        },
                    },
                    {
                        type: 'button',
                        title: t('remove'),
                        icon: RemoveIcon,
                        onClick: () => {
                            coreService.localEventBus.call('folder/remove', { id });
                        },
                    },
                ] : []),
            ],
            position: {
                top,
                left,
            },
        });
    };

    useEffect(() => {
        bookmarksService.folders.get(id).then((findFolder) => setFolder(findFolder));

        bookmarksService.folders.getFoldersByParent(id)
            .then((foundFolders) => {
                setFolders(foundFolders);
            });

        bookmarksService.bookmarks.getAllInFolder(id)
            .then((searchResult) => {
                setFindBookmarks(searchResult);
                setIsSearching(false);
            });
    }, []);

    return (
        <Card className={classes.root} elevation={16}>
            <CardHeader
                avatar={(
                    <FolderIcon />
                )}
                title={folder?.name}
                classes={{ avatar: classes.avatar }}
                action={(
                    <IconButton
                        onClick={(event) => handlerContextMenu(event.currentTarget)}
                        ref={buttonRef}
                    >
                        <MoreIcon />
                    </IconButton>
                )}
            />
            <List disablePadding className={classes.list}>
                <Scrollbar>
                    {isSearching && (
                        <FullScreenStub style={{ height: 300 }}>
                            <CircularProgress />
                        </FullScreenStub>
                    )}
                    {!isSearching && (findBookmarks.length === 0 && folders.length === 0) && (
                        <FullScreenStub
                            style={{ height: 300 }}
                            message={t('fap.folder.emptyTitle')}
                            description={t('fap.folder.emptyDescription')}
                        />
                    )}
                    {folders && folders.map((folder, index) => (
                        <FolderButton
                            offset
                            key={folder.id}
                            {...folder}
                            variant="row"
                            divider={index !== folders.length - 1}
                        />
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
