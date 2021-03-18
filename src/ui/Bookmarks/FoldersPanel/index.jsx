import React, { useEffect } from 'react';
import {
    Box,
    CardHeader,
    IconButton,
    List,
    Tooltip,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ArrowBackRounded as BackIcon } from '@material-ui/icons';
import LogoIcon from '@/images/logo-icon.svg';
import { useLocalObservable, observer } from 'mobx-react-lite';
import FoldersUniversalService from '@/stores/universal/bookmarks/folders';
import Stub from '@/ui-components/Stub';
import { FETCH } from '@/enum';
import stateRender from '@/utils/stateRender';
import FolderItem from '@/ui/Bookmarks/FoldersPanel/FolderItem';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
    root: {
        width: 300,
        minWidth: 230,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        backgroundColor: theme.palette.type === 'dark' ? theme.palette.grey[900] : theme.palette.grey[50],
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

function FoldersPanel({ selectFolderId, onSelectFolder, searchEverywhere = false, onlyFavorites = false }) {
    const classes = useStyles();
    const { t } = useTranslation(['folder', 'bookmark']);
    const store = useLocalObservable(() => ({
        folder: null,
        childFolders: null,
        folderState: FETCH.WAIT,
        childFoldersState: FETCH.WAIT,
    }));

    useEffect(() => {
        if (selectFolderId === null) return;

        store.folderState = FETCH.PENDING;
        store.childFoldersState = FETCH.PENDING;
        store.pathState = FETCH.PENDING;

        FoldersUniversalService.get(selectFolderId)
            .then((folder) => {
                store.folder = folder;
                store.folderState = FETCH.DONE;
            });

        FoldersUniversalService.getFoldersByParent(selectFolderId)
            .then((folders) => {
                store.childFolders = folders;
                store.childFoldersState = FETCH.DONE;
            });
    }, [selectFolderId]);

    return (
        <Box className={classes.root} pt={1} pb={2}>
            <CardHeader
                avatar={(
                    selectFolderId === 1 || searchEverywhere ? (
                        <LogoIcon className={classes.icon} />
                    ) : (
                        <Tooltip title={t('common:button.back')}>
                            <IconButton
                                className={classes.backButton}
                                onClick={() => onSelectFolder(store.folder?.parentId || 1)}
                            >
                                <BackIcon className={classes.icon} />
                            </IconButton>
                        </Tooltip>
                    )
                )}
                title={stateRender(
                    store.folderState,
                    searchEverywhere ? 'rigami' : (store.folder?.name || t('unknown')),
                    t('common:loading'),
                    'failed load',
                )}
                classes={{
                    root: classes.padding,
                    avatar: classes.avatar,
                    title: classes.title,
                }}
            />
            {!searchEverywhere && store.childFolders && store.childFolders.length !== 0 && (
                <List disablePadding>
                    {store.childFolders.map((folder) => (
                        <FolderItem
                            key={folder.id}
                            id={folder.id}
                            name={folder.name}
                            onClick={() => onSelectFolder(folder.id)}
                        />
                    ))}
                </List>
            )}
            {searchEverywhere && (<Stub message={t('bookmark:search.everywhere', { context: 'description' })} />)}
        </Box>
    );
}

export default observer(FoldersPanel);
