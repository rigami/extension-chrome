import React, { useEffect, useRef, useState } from 'react';
import {
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemSecondaryAction,
    IconButton,
    Tooltip,
    Box, Breadcrumbs, Typography, Container, Link,
} from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import {
    FolderRounded as FolderIcon,
    BookmarkBorderRounded as PinnedFavoriteIcon,
    BookmarkRounded as UnpinnedFavoriteIcon,
    EditRounded as EditIcon,
    DeleteRounded as RemoveIcon,
} from '@material-ui/icons';
import useBookmarksService from '@/stores/BookmarksProvider';
import useCoreService from '@/stores/BaseStateProvider';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import FolderCard from '@/ui/Bookmarks/Folders/Card';
import clsx from 'clsx';
import FullScreenStub from '@/ui-components/FullscreenStub';
import BookmarksGrid from '@/ui/Bookmarks/BookmarksGrid';
import Category from '../Categories/CtegoryWrapper';
import CardLink from '../CardLink';

const useStyles = makeStyles((theme) => ({
    rootWrapper: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        '&:hover $actions': {
            opacity: 1,
            pointerEvents: 'auto',
        },
    },
    root: {},
    container: {
        marginTop: theme.spacing(3),
        listStyle: 'none',
    },
    text: { maxWidth: 700 },
    title: {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    description: {
        display: '-webkit-box',
        overflow: 'hidden',
        '-webkit-box-orient': 'vertical',
        '-webkit-line-clamp': 3,
    },
    actions: {
        opacity: 0,
        pointerEvents: 'none',
    },
    bookmarksWrapper: {
        display: 'flex',
        flexDirection: 'column',
    },
    folderMarginRight: { marginRight: theme.spacing(2) },
    folderMarginBottom: {
        marginBottom: theme.spacing(2),
        display: 'inline-block',
    },
    foldersBlock: { width: '100%' },
    bookmarksBlock: {
        width: '100%',
        display: 'flex',
    },
}));

function FolderWrapper({ folder, onSelect }) {
    const { t } = useTranslation();
    const classes = useStyles();
    const coreService = useCoreService();
    const bookmarksService = useBookmarksService();
    const foldersService = bookmarksService.folders;
    const anchorEl = useRef(null);
    const [path, setPath] = useState(t('loading'));
    const [folders, setFolders] = useState([]);
    const [findBookmarks, setFindBookmarks] = useState(null);

    const isPin = () => bookmarksService.favorites.find((fav) => fav.type === 'folder' && fav.id === folder?.id);

    const handlePin = () => {
        if (isPin()) {
            bookmarksService.removeFromFavorites({
                type: 'folder',
                id: folder?.id,
            });
        } else {
            bookmarksService.addToFavorites({
                type: 'folder',
                id: folder?.id,
            });
        }
    };

    useEffect(() => {
        if (folder?.id) {
            foldersService.getPath(folder?.id)
                .then((folderPath) => setPath(folderPath));

            foldersService.getFoldersByParent(folder?.id)
                .then((foundFolders) => {
                    setFolders(foundFolders);
                });

            bookmarksService.bookmarks.getAllInFolder(folder?.id)
                .then((searchResult) => {
                    console.log('searchResult', searchResult);
                    setFindBookmarks(searchResult);
                });
        }
    }, [folder?.id]);

    return (
        <Box className={classes.rootWrapper}>
            <ListItem
                disableGutters
                component="div"
                classes={{
                    root: classes.root,
                    container: classes.container,
                }}
            >
                <ListItemIcon style={{ minWidth: 36 }}>
                    <FolderIcon style={{ }} />
                </ListItemIcon>
                <ListItemText
                    classes={{
                        root: classes.text,
                        primary: classes.title,
                        secondary: classes.description,
                    }}
                    primary={(folder && Array.isArray(path) && (
                        <Breadcrumbs>
                            {path.map(({ name, id, parentId }, index) => (index === path.length - 1 ? (
                                <Typography
                                    key={id}
                                    color="textPrimary"
                                >
                                    {name}
                                </Typography>
                            ) : (
                                <Link
                                    key={id}
                                    color="textSecondary"
                                    href="/"
                                    onClick={(event) => {
                                        event.preventDefault();
                                        onSelect(parentId && id);
                                    }}
                                >
                                    {name}
                                </Link>
                            )))}
                        </Breadcrumbs>
                    )) || (folder && path) || (
                        <Typography className={classes.notSelect}>
                            {t('folder.unknownFolder')}
                        </Typography>
                    )}
                />
                <ListItemSecondaryAction className={classes.actions}>
                    <Tooltip
                        title={
                            isPin()
                                ? 'Открепить от панели быстрого доступа'
                                : 'Закрепить на панели быстрого доступа'
                        }
                    >
                        <IconButton onClick={handlePin}>
                            {isPin() ? (<UnpinnedFavoriteIcon />) : (<PinnedFavoriteIcon />)}
                        </IconButton>
                    </Tooltip>
                    {folder?.parentId !== 0 && (
                        <React.Fragment>
                            <Tooltip title="Изменить">
                                <IconButton
                                    buttonRef={anchorEl}
                                    onClick={() => coreService.localEventBus.call(
                                        'folder/edit',
                                        {
                                            id: folder?.id,
                                            anchorEl: anchorEl.current,
                                        },
                                    )}
                                >
                                    <EditIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Удалить">
                                <IconButton
                                    onClick={() => coreService.localEventBus.call(
                                        'folder/remove',
                                        { id: folder?.id },
                                    )}
                                >
                                    <RemoveIcon />
                                </IconButton>
                            </Tooltip>
                        </React.Fragment>
                    )}
                </ListItemSecondaryAction>
            </ListItem>
            <Box className={classes.bookmarksWrapper}>
                <Box className={classes.foldersBlock}>
                    {folders.map((folder, index) => (
                        <FolderCard
                            key={folder.id}
                            id={folder.id}
                            name={folder.name}
                            className={clsx(
                                classes.folderMarginBottom,
                                (index + 1) % coreService.storage.temp.columnsCount && classes.folderMarginRight,
                            )}
                            onClick={() => onSelect(folder.id)}
                        />
                    ))}
                </Box>
                <Box className={classes.bookmarksBlock}>
                    {findBookmarks && findBookmarks.length === 0 && (
                        <FullScreenStub
                            message={t('folder.noBookmarks.title')}
                            description={t('folder.noBookmarks.description')}
                        />
                    )}
                    <BookmarksGrid bookmarks={findBookmarks} />
                </Box>
            </Box>
        </Box>
    );
}

export default observer(FolderWrapper);
