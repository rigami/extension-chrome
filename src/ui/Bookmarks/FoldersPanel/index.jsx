import React, { useEffect } from 'react';
import {
    Box,
    CardHeader,
    IconButton,
    List,
    Tooltip,
} from '@material-ui/core';
import { fade, makeStyles } from '@material-ui/core/styles';
import { ArrowBackRounded as BackIcon } from '@material-ui/icons';
import LogoIcon from '@/images/logo-icon.svg';
import { useLocalObservable, observer } from 'mobx-react-lite';
import FoldersUniversalService from '@/stores/universal/bookmarks/folders';
import Stub from '@/ui-components/Stub';
import { FETCH } from '@/enum';
import stateRender from '@/utils/stateRender';
import FolderItem from '@/ui/Bookmarks/FoldersPanel/FolderItem';
import { useTranslation } from 'react-i18next';
import useBookmarksService from '@/stores/app/BookmarksProvider';

const useStyles = makeStyles((theme) => ({
    root: {
        width: 300,
        minWidth: 230,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        backgroundColor: fade(theme.palette.background.backdrop, 0.4),
    },
    header: {
        paddingTop: theme.spacing(3),
        paddingBottom: theme.spacing(3),
    },
    bottomOffset: { marginTop: 'auto' },
    favorite: {
        color: theme.palette.error.main,
        fontFamily: theme.typography.primaryFontFamily,
    },
    padding: {
        paddingLeft: theme.spacing(4),
        paddingRight: theme.spacing(4),
    },
    title: {
        fontSize: '1.5rem',
        fontWeight: 800,
        fontFamily: theme.typography.primaryFontFamily,
        display: '-webkit-box',
        overflow: 'hidden',
        wordBreak: 'break-word',
        lineHeight: 1.2,
        '-webkit-box-orient': 'vertical',
        '-webkit-line-clamp': 3,
        minHeight: theme.spacing(4),
    },
    avatar: {
        display: 'flex',
        alignSelf: 'flex-start',
        marginTop: theme.spacing(0.25),
        marginBottom: theme.spacing(0.25),
    },
    icon: {
        width: 28,
        height: 28,
    },
    backButton: { margin: theme.spacing(-1.5) },
    primaryFont: {
        fontWeight: 800,
        fontFamily: theme.typography.primaryFontFamily,
    },
}));

function FoldersPanel({ searchService: service }) {
    const classes = useStyles();
    const { t } = useTranslation(['folder', 'bookmark']);
    const bookmarksService = useBookmarksService();
    const store = useLocalObservable(() => ({
        folder: null,
        childFolders: null,
        folderState: FETCH.WAIT,
        childFoldersState: FETCH.WAIT,
    }));

    useEffect(() => {
        if (service.activeFolderId === null) return;

        store.folderState = FETCH.PENDING;
        store.childFoldersState = FETCH.PENDING;
        store.pathState = FETCH.PENDING;

        FoldersUniversalService.get(service.activeFolderId)
            .then((folder) => {
                store.folder = folder;
                store.folderState = FETCH.DONE;
            });

        FoldersUniversalService.getFoldersByParent(service.activeFolderId)
            .then((folders) => {
                store.childFolders = folders.sort((folderA, folderB) => {
                    const isFavoriteA = bookmarksService.findFavorite({
                        itemId: folderA.id,
                        itemType: 'folder',
                    });
                    const isFavoriteB = bookmarksService.findFavorite({
                        itemId: folderB.id,
                        itemType: 'folder',
                    });

                    if (isFavoriteA && !isFavoriteB) return -1;
                    else if (!isFavoriteA && isFavoriteB) return 1;

                    return 0;
                });
                store.childFoldersState = FETCH.DONE;
            });
    }, [service.activeFolderId, bookmarksService.lastTruthSearchTimestamp]);

    return (
        <Box className={classes.root} pt={1} pb={2}>
            <CardHeader
                avatar={(
                    service.activeFolderId === 1 || service.searchEverywhere ? (
                        <LogoIcon className={classes.icon} />
                    ) : (
                        <Tooltip title={t('common:button.back')}>
                            <IconButton
                                className={classes.backButton}
                                onClick={() => service.setActiveFolder(store.folder?.parentId || 1)}
                            >
                                <BackIcon className={classes.icon} />
                            </IconButton>
                        </Tooltip>
                    )
                )}
                title={stateRender(
                    store.folderState,
                    service.searchEverywhere ? 'rigami' : (store.folder?.name || t('unknown')),
                    t('common:loading'),
                    'failed load',
                )}
                classes={{
                    root: clsx(classes.padding, classes.header),
                    avatar: classes.avatar,
                    title: classes.title,
                }}
            />
            {!service.searchEverywhere && store.childFolders && store.childFolders.length !== 0 && (
                <List disablePadding>
                    {store.childFolders.map((folder) => (
                        <FolderItem
                            key={folder.id}
                            id={folder.id}
                            name={folder.name}
                            onClick={() => service.setActiveFolder(folder.id)}
                        />
                    ))}
                </List>
            )}
            {service.searchEverywhere && (
                <Stub message={t('bookmark:search.everywhere', { context: 'description' })} />
            )}
        </Box>
    );
}

export default observer(FoldersPanel);
