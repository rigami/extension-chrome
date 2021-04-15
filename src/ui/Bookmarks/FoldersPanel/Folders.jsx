import {
    Box,
    ButtonBase,
    Collapse,
    List,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    Tooltip,
} from '@material-ui/core';
import {
    AddRounded as AddIcon,
    ChevronRightRounded as ChevronRightIcon,
    ExpandMoreRounded,
    FavoriteRounded as FavoriteIcon,
} from '@material-ui/icons';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import { useLocalObservable, observer } from 'mobx-react-lite';
import { FETCH } from '@/enum';
import FoldersUniversalService from '@/stores/universal/bookmarks/folders';
import { fade, makeStyles } from '@material-ui/core/styles';
import useAppService from '@/stores/app/AppStateProvider';
import useCoreService from '@/stores/app/BaseStateProvider';
import pin from '@/utils/contextMenu/pin';
import edit from '@/utils/contextMenu/edit';
import remove from '@/utils/contextMenu/remove';
import EditFolderModal from '@/ui/Bookmarks/Folders/EditModal';
import asyncAction from '@/utils/asyncAction';

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
    addSubFolder: {
        borderRadius: theme.spacing(0.5),
        padding: 2,
        '& svg': {
            width: 18,
            height: 18,
        },
    },
    expandWrapper: {},
    expandIcon: {
        borderRadius: theme.spacing(0.5),
        padding: 2,
        marginRight: 'auto',
        '& svg': {
            width: 18,
            height: 18,
        },
    },
    itemRoot: {
        color: theme.palette.text.secondary,
        padding: 0,
        position: 'relative',
        '&:hover > $content': { backgroundColor: theme.palette.action.hover },
        '&:focus > $content, &$selected > $content': {
            backgroundColor: theme.palette.action.selected,
            color: theme.palette.text.primary,
        },
        '&:focus > $content $label, &:hover > $content $label, &$selected > $content $label': { backgroundColor: 'transparent !important' },
    },
    itemContainer: {
        '& $addSubFolder': { opacity: 0 },
        '&:hover $addSubFolder': { opacity: 1 },
    },
    expanded: {},
    selected: {},
    content: {
        height: theme.spacing(4),
        color: theme.palette.text.secondary,
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
        '$expanded > &': { fontWeight: theme.typography.fontWeightRegular },
    },
    group: {
        marginLeft: 0,
        '& $content': { paddingLeft: theme.spacing(2) },
    },
    label: {
        color: 'inherit',
        fontSize: '0.9rem',
        fontWeight: 550,
    },
    addRootButton: {
        height: theme.spacing(4),
        color: theme.palette.text.secondary,
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
        fontSize: '0.9rem',
        fontWeight: 550,
        justifyContent: 'flex-start',
        fontFamily: theme.typography.primaryFontFamily,
        '& svg': {
            marginRight: theme.spacing(0.5),
            width: 18,
            height: 18,
        },
    },
    icon: {
        minWidth: 18 + 4,
        '& svg': {
            width: 18,
            height: 18,
        },
    },
    itemInset: { paddingLeft: 22 },
    text: {
        color: theme.palette.text.secondary,
        fontSize: '0.9rem',
        fontWeight: 550,
        fontFamily: theme.typography.primaryFontFamily,
    },
    favorite: {
        color: theme.palette.error.main,
        width: 12,
        height: 12,
        marginLeft: theme.spacing(1),
        marginRight: 5,
    },
    actions: {
        display: 'flex',
        alignItems: 'center',
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        pointerEvents: 'none',
        flexDirection: 'row',
        transform: 'none',
        justifyContent: 'flex-end',
        padding: theme.spacing(0, 0.5),
        '& > *': { pointerEvents: 'all' },
    },
}));

function FolderItem(props) {
    const {
        id,
        name,
        childExist,
        isExpand,
        isSelected,
        level,
        onClick,
        onExpandChange,
        onCreateSubFolder,
    } = props;
    const classes = useStyles();
    const { t } = useTranslation(['folder', 'bookmark']);
    const rootRef = useRef();
    const appService = useAppService();
    const bookmarksService = useBookmarksService();
    const coreService = useCoreService();
    const [isPin, setIsPin] = useState(bookmarksService.findFavorite({
        itemId: id,
        itemType: 'folder',
    }));

    const contextMenu = () => [
        pin({
            itemId: id,
            itemType: 'folder',
            t,
            bookmarksService,
        }),
        edit({
            itemId: id,
            itemType: 'folder',
            t,
            coreService,
            anchorEl: rootRef.current,
            options: { placement: 'left' },
        }),
        remove({
            itemId: id,
            itemType: 'folder',
            t,
            coreService,
        }),
    ];

    useEffect(() => {
        setIsPin(bookmarksService.findFavorite({
            itemId: id,
            itemType: 'folder',
        }));
    }, [bookmarksService.favorites.length]);

    return (
        <ListItem
            ref={rootRef}
            classes={{
                root: classes.itemRoot,
                container: classes.itemContainer,
            }}
            onClick={onClick}
            style={{ paddingLeft: 8 + level * 8 }}
            button
            selected={isSelected}
            onContextMenu={appService?.contextMenu?.(contextMenu)}
        >
            <ListItemText
                inset
                primary={name}
                classes={{
                    primary: classes.text,
                    inset: classes.itemInset,
                }}
            />
            <ListItemSecondaryAction className={classes.actions}>
                {childExist && (
                    <ButtonBase
                        className={classes.expandIcon}
                        onClick={onExpandChange}
                        style={{ marginLeft: level * 8 }}
                    >
                        {isExpand ? (<ExpandMoreRounded />) : (<ChevronRightIcon />)}
                    </ButtonBase>
                )}
                <Tooltip title={t('button.create', { context: 'sub' })}>
                    <ButtonBase
                        className={classes.addSubFolder}
                        onClick={() => onCreateSubFolder({
                            anchorEl: rootRef.current,
                            parentFolder: id,
                        })}
                    >
                        <AddIcon />
                    </ButtonBase>
                </Tooltip>
                {isPin && (
                    <FavoriteIcon className={classes.favorite} />
                )}
            </ListItemSecondaryAction>
        </ListItem>
    );
}

const ObserverFolderItem = observer(FolderItem);

function TreeItem(props) {
    const {
        folder,
        defaultExpanded = [],
        level,
        isExpanded,
        selectedId,
        onClick,
        onExpandChange,
        onCreateSubFolder,
    } = props;
    const childExist = Array.isArray(folder.children) && folder.children.length > 0;

    return (
        <React.Fragment>
            <ObserverFolderItem
                id={folder.id}
                name={folder.name}
                childExist={childExist}
                isExpand={isExpanded}
                isSelected={selectedId === folder.id}
                level={level}
                onClick={() => onClick(folder)}
                onExpandChange={onExpandChange}
                onCreateSubFolder={onCreateSubFolder}
            />
            {childExist && (
                <Collapse in={isExpanded}>
                    <TreeLevel
                        data={folder.children}
                        defaultExpanded={defaultExpanded}
                        level={level + 1}
                        selectedId={selectedId}
                        onClickFolder={onClick}
                        onCreateSubFolder={onCreateSubFolder}
                    />
                </Collapse>
            )}
        </React.Fragment>
    );
}

function TreeLevel(props) {
    const {
        data,
        defaultExpanded = [],
        level,
        selectedId,
        onClickFolder,
        onCreateSubFolder,
    } = props;
    const [expanded, setExpanded] = useState(defaultExpanded);

    console.log('defaultExpanded:', defaultExpanded);

    return data.map((folder) => (
        <TreeItem
            key={folder.id}
            defaultExpanded={defaultExpanded}
            folder={folder}
            level={level}
            isExpanded={expanded.includes(folder.id)}
            selectedId={selectedId}
            onClick={(selectFolder) => onClickFolder(selectFolder)}
            onExpandChange={() => {
                if (expanded.includes(folder.id)) {
                    setExpanded(expanded.filter((id) => id !== folder.id));
                } else {
                    setExpanded([...expanded, folder.id]);
                }
            }}
            onCreateSubFolder={onCreateSubFolder}
        />
    ));
}

function Folders({ selectFolder, onClickFolder }) {
    const classes = useStyles();
    const { t } = useTranslation(['folder', 'bookmark']);
    const bookmarksService = useBookmarksService();
    const store = useLocalObservable(() => ({
        tree: [],
        path: [],
        folder: null,
        anchorEl: null,
        expanded: [],
        state: FETCH.WAIT,
    }));

    useEffect(() => {
        store.state = FETCH.PENDING;

        asyncAction(async () => {
            const path = selectFolder ? await FoldersUniversalService.getPath(selectFolder) : [];
            const tree = await FoldersUniversalService.getTree();

            store.path = path.map(({ id }) => id).slice(0, -1);
            store.tree = tree;
            store.state = FETCH.DONE;
        }).catch((error) => {
            console.error(error);
            store.state = FETCH.FAILED;
        });
    }, [bookmarksService.lastTruthSearchTimestamp]);

    return (
        <Box>
            <List disablePadding>
                {store.state === FETCH.DONE && (
                    <TreeLevel
                        data={store.tree}
                        defaultExpanded={store.path}
                        level={0}
                        selectedId={selectFolder}
                        onClickFolder={onClickFolder}
                        onCreateSubFolder={({ anchorEl, parentFolder }) => {
                            store.anchorEl = anchorEl;
                            store.parentFolder = parentFolder;
                        }}
                    />
                )}
                <ListItem
                    className={classes.addRootButton}
                    onClick={(event) => {
                        store.anchorEl = event.currentTarget;
                        store.parentFolder = 0;
                    }}
                    button
                    selected={store.parentFolder === 0}
                >
                    <AddIcon />
                    {t('button.create')}
                </ListItem>
            </List>
            <EditFolderModal
                simple
                isOpen={Boolean(store.anchorEl)}
                anchorEl={store.anchorEl}
                onClose={() => {
                    store.anchorEl = null;
                    store.parentFolder = null;
                }}
                onSave={() => {
                    store.anchorEl = null;
                    store.parentFolder = null;
                }}
                parentId={store.parentFolder}
                placement="left"
            />
        </Box>
    );
}

export default observer(Folders);
