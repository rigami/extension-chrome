import React, { useEffect } from 'react';
import {
    Box,
    CardHeader,
    IconButton,
    List,
    Tooltip,
} from '@material-ui/core';
import { fade, makeStyles } from '@material-ui/core/styles';
import {
    ArrowBackRounded as BackIcon,
    ExpandMoreRounded as ExpandMoreIcon,
    ChevronRightRounded as ChevronRightIcon,
} from '@material-ui/icons';
import LogoIcon from '@/images/logo-icon.svg';
import { useLocalObservable, observer } from 'mobx-react-lite';
import FoldersUniversalService from '@/stores/universal/bookmarks/folders';
import Stub from '@/ui-components/Stub';
import { FETCH } from '@/enum';
import stateRender from '@/utils/stateRender';
import FolderItem from '@/ui/Bookmarks/FoldersPanel/FolderItem';
import { useTranslation } from 'react-i18next';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import clsx from 'clsx';
import { TreeView, TreeItem } from '@material-ui/lab';
import LogoText from '@/images/logo-text.svg';

const useStyles = makeStyles((theme) => ({
    root: {
        width: 260,
        minWidth: 230,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        backgroundColor: fade(theme.palette.background.backdrop, 0.4),
    },
    header: { minHeight: theme.spacing(9.75) },
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
    avatar: { display: 'flex' },
    appLogoIcon: {
        width: 28,
        height: 28,
    },
    appLogoText: {
        height: 24,
        width: 'auto',
    },
    appLogoTextWrapper: { display: 'flex' },
    backButton: { margin: theme.spacing(-1.5) },
    primaryFont: {
        fontWeight: 800,
        fontFamily: theme.typography.primaryFontFamily,
    },
    itemRoot: {
        color: theme.palette.text.secondary,
        '&:hover > $content': { backgroundColor: theme.palette.action.hover },
        '&:focus > $content, &$selected > $content': {
            backgroundColor: theme.palette.action.selected,
            color: theme.palette.text.primary,
        },
        '&:focus > $content $label, &:hover > $content $label, &$selected > $content $label': { backgroundColor: 'transparent !important' },
    },
    expanded: {},
    selected: {},
    content: {
        height: theme.spacing(4),
        color: theme.palette.text.secondary,
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
        fontWeight: theme.typography.fontWeightMedium,
        '$expanded > &': { fontWeight: theme.typography.fontWeightRegular },
    },
    group: {
        marginLeft: 0,
        '& $content': { paddingLeft: theme.spacing(2) },
    },
    label: {
        fontWeight: 'inherit',
        color: 'inherit',
    },
}));

function FoldersPanel({ searchService: service }) {
    const classes = useStyles();
    const { t } = useTranslation(['folder', 'bookmark']);
    const bookmarksService = useBookmarksService();
    const store = useLocalObservable(() => ({
        tree: [],
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

        /* FoldersUniversalService.get(service.activeFolderId)
            .then((folder) => {
                store.folder = folder;
                store.folderState = FETCH.DONE;
            }); */

        FoldersUniversalService.getTree()
            .then((tree) => {
                console.log('tree:', tree);
                store.tree = tree;

                /* store.childFolders = folders.sort((folderA, folderB) => {
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
                store.childFoldersState = FETCH.DONE; */
            });
    }, [service.activeFolderId, bookmarksService.lastTruthSearchTimestamp]);

    const renderTree = (folder) => (
        <TreeItem
            key={folder.id}
            nodeId={folder.id}
            label={folder.name}
            classes={{
                root: classes.itemRoot,
                content: classes.content,
                expanded: classes.expanded,
                selected: classes.selected,
                group: classes.group,
                label: classes.label,
            }}
            onClick={() => service.setActiveFolder(folder.id)}
        >
            {Array.isArray(folder.children) ? folder.children.map((childFolder) => renderTree(childFolder)) : null}
        </TreeItem>
    );

    return (
        <Box className={classes.root} pb={2}>
            <CardHeader
                avatar={(<LogoIcon className={classes.appLogoIcon} />)}
                title={(<LogoText className={classes.appLogoText} />)}
                disableTypography
                classes={{
                    root: clsx(classes.padding, classes.header),
                    avatar: classes.avatar,
                    content: classes.appLogoTextWrapper,
                }}
            />
            <TreeView
                defaultCollapseIcon={<ExpandMoreIcon />}
                defaultExpandIcon={<ChevronRightIcon />}
            >
                {store.tree.map((folder) => renderTree(folder))}
            </TreeView>
            {/* !service.searchEverywhere && store.childFolders && store.childFolders.length !== 0 && (
                <List disablePadding dense>
                    {store.childFolders.map((folder) => (
                        <FolderItem
                            key={folder.id}
                            id={folder.id}
                            name={folder.name}
                            onClick={() => service.setActiveFolder(folder.id)}
                        />
                    ))}
                </List>
            ) */}
        </Box>
    );
}

export default observer(FoldersPanel);
