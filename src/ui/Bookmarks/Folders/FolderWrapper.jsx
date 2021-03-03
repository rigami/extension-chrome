import React, { useEffect, useRef, useState } from 'react';
import {
    ListItem,
    ListItemText,
    ListItemIcon,
    ListItemSecondaryAction,
    IconButton,
    Tooltip,
    Box,
    Breadcrumbs,
    Typography,
    Link,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
    FolderRounded as FolderIcon,
    BookmarkBorderRounded as PinnedFavoriteIcon,
    BookmarkRounded as UnpinnedFavoriteIcon,
    EditRounded as EditIcon,
    DeleteRounded as RemoveIcon,
} from '@material-ui/icons';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import useCoreService from '@/stores/app/BaseStateProvider';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import FolderCard from '@/ui/Bookmarks/Folders/Card';
import clsx from 'clsx';
import FullScreenStub from '@/ui-components/FullscreenStub';
import BookmarksGrid from '@/ui/Bookmarks/BookmarksGrid';
import FoldersUniversalService from '@/stores/universal/bookmarks/folders';
import BookmarksUniversalService from '@/stores/universal/bookmarks/bookmarks';
import Favorite from '@/stores/universal/bookmarks/entities/favorite';

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
    const anchorEl = useRef(null);
    const [path, setPath] = useState(t('loading'));
    const [folders, setFolders] = useState([]);
    const [findBookmarks, setFindBookmarks] = useState(null);

    const isPin = () => bookmarksService.findFavorite({
        itemType: 'folder',
        itemId: folder?.id,
    });

    const handlePin = () => {
        if (isPin()) {
            bookmarksService.removeFromFavorites(bookmarksService.findFavorite({
                itemType: 'folder',
                itemId: folder?.id,
            })?.id);
        } else {
            bookmarksService.addToFavorites(new Favorite({
                itemType: 'folder',
                itemId: folder?.id,
            }));
        }
    };

    useEffect(() => {
        if (folder?.id) {
            FoldersUniversalService.getPath(folder?.id)
                .then((folderPath) => setPath(folderPath));

            FoldersUniversalService.getFoldersByParent(folder?.id)
                .then((foundFolders) => {
                    setFolders(foundFolders);
                });

            BookmarksUniversalService.getAllInFolder(folder?.id)
                .then((searchResult) => {
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
                        <IconButton
                            data-ui-path={isPin() ? 'folder.unpin' : 'folder.pin'}
                            onClick={handlePin}
                        >
                            {isPin() ? (<UnpinnedFavoriteIcon />) : (<PinnedFavoriteIcon />)}
                        </IconButton>
                    </Tooltip>
                    {folder?.id !== 1 && (
                        <React.Fragment>
                            <Tooltip title="Изменить">
                                <IconButton
                                    data-ui-path="folder.edit"
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
                                    data-ui-path="folder.remove"
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
                    {folders.map((currFolder, index) => (
                        <FolderCard
                            key={currFolder.id}
                            id={currFolder.id}
                            name={currFolder.name}
                            className={clsx(
                                classes.folderMarginBottom,
                                (index + 1) % coreService.storage.temp.columnsCount && classes.folderMarginRight,
                            )}
                            onClick={() => onSelect(currFolder.id)}
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
                    {findBookmarks && Array.isArray(findBookmarks) && (
                        <BookmarksGrid bookmarks={findBookmarks} />
                    )}
                </Box>
            </Box>
        </Box>
    );
}

export default observer(FolderWrapper);
