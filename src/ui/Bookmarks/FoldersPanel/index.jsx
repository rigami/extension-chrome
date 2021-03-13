import React, { useEffect } from 'react';
import {
    Box,
    CardHeader,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Tooltip,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { ArrowBackRounded as BackIcon, FavoriteRounded as FavIcon } from '@material-ui/icons';
import clsx from 'clsx';
import LogoIcon from '@/images/logo-icon.svg';
import { useLocalObservable, observer } from 'mobx-react-lite';
import FoldersUniversalService from '@/stores/universal/bookmarks/folders';
import Stub from '@/ui-components/Stub';
import { FETCH } from '@/enum';
import stateRender from '@/utils/stateRender';

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
    },
    avatar: { display: 'flex' },
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

function FoldersPanel({ selectFolderId, onSelectFolder, searchEverywhere = false }) {
    const classes = useStyles();
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
                        <Tooltip title="Back">
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
                    searchEverywhere ? 'rigami' : (store.folder?.name || 'unknown'),
                    'loading...',
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
                        <ListItem
                            button
                            key={folder.id}
                            className={classes.padding}
                            onClick={() => onSelectFolder(folder.id)}
                        >
                            <ListItemText primary={folder.name} />
                        </ListItem>
                    ))}
                </List>
            )}
            {searchEverywhere && (<Stub message="Search for bookmarks throughout the system" />)}
            {/* <Box className={classes.bottomOffset}>
                <ListItem
                    button
                    component="button"
                    className={clsx(classes.padding, classes.favorite)}
                >
                    <ListItemIcon className={classes.favorite}>
                        <FavIcon />
                    </ListItemIcon>
                    <ListItemText
                        primary="Favorite"
                        classes={{ primary: classes.primaryFont }}
                    />
                </ListItem>
            </Box> */}
        </Box>
    );
}

export default observer(FoldersPanel);
