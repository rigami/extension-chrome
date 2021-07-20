import React, { useEffect, useRef, useState } from 'react';
import {
    Box,
    ButtonBase,
    Collapse,
    List,
    ListItem,
    Tooltip,
} from '@material-ui/core';
import {
    AddRounded as AddIcon,
    ChevronRightRounded as ChevronRightIcon,
    ExpandMoreRounded,
    StarRounded as FavoriteIcon,
    HomeRounded as HomeIcon,
} from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import { useLocalObservable, observer } from 'mobx-react-lite';
import { FETCH } from '@/enum';
import FoldersUniversalService from '@/stores/universal/bookmarks/folders';
import { makeStyles } from '@material-ui/core/styles';
import EditFolderModal from '@/ui/Bookmarks/Folders/EditModal';
import asyncAction from '@/utils/asyncAction';
import { captureException } from '@sentry/react';
import useContextMenu from '@/stores/app/ContextMenuProvider';
import clsx from 'clsx';
import { Item, ItemAction } from '@/ui/Bookmarks/FoldersPanel/Item';

const useStyles = makeStyles((theme) => ({
    expandIcon: {
        borderRadius: theme.spacing(0.5),
        padding: 2,
        marginRight: 'auto',
        '& svg': {
            width: 18,
            height: 18,
        },
    },
    disabledExpand: { color: theme.palette.action.disabled },
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
    favorite: {
        color: theme.palette.favorite.main,
        width: 18,
        height: 18,
        marginLeft: theme.spacing(0.5),
        padding: theme.spacing(0.25),
        boxSizing: 'content-box',
    },
    folderItem: { '&:hover $addSubFolder': { display: 'flex' } },
    addSubFolder: { display: 'none' },
}));

function FolderItem(props) {
    const {
        id,
        name,
        childExist,
        isDisabled,
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
    const bookmarksService = useBookmarksService();
    const contextMenu = useContextMenu({
        itemId: id,
        itemType: 'folder',
        disableRemove: id === 1,
        disableMove: id === 1,
    });
    const [isPin, setIsPin] = useState(bookmarksService.findFavorite({
        itemId: id,
        itemType: 'folder',
    }));

    useEffect(() => {
        setIsPin(bookmarksService.findFavorite({
            itemId: id,
            itemType: 'folder',
        }));
    }, [bookmarksService.favorites.length]);

    return (
        <Item
            ref={rootRef}
            level={level}
            disabled={isDisabled}
            selected={isSelected}
            onContextMenu={contextMenu}
            title={name}
            onClick={() => {
                if (isExpand && isSelected) onExpandChange();
                if (!isExpand) onExpandChange();
                onClick();
            }}
            className={classes.folderItem}
            startAction={childExist && (
                <ButtonBase
                    disabled={isDisabled}
                    className={clsx(classes.expandIcon, isDisabled && classes.disabledExpand)}
                    onClick={onExpandChange}
                    // style={{ marginLeft: level * 8 }}
                >
                    {isExpand ? (<ExpandMoreRounded />) : (<ChevronRightIcon />)}
                </ButtonBase>
            )}
            actions={(
                <React.Fragment>
                    {!isDisabled && (
                        <Tooltip title={t('button.create', { context: 'sub' })}>
                            <ItemAction
                                className={classes.addSubFolder}
                                onClick={() => onCreateSubFolder({
                                    anchorEl: rootRef.current,
                                    parentFolder: id,
                                })}
                            >
                                <AddIcon />
                            </ItemAction>
                        </Tooltip>
                    )}
                    {isPin && (
                        <FavoriteIcon className={classes.favorite} />
                    )}
                </React.Fragment>
            )}
        />
    );
}

const ObserverFolderItem = observer(FolderItem);

function TreeItem(props) {
    const {
        folder,
        expanded = [],
        disabled = [],
        level,
        isDisabled,
        isExpanded,
        selectedId,
        onClick,
        onCreateSubFolder,
        onChangeExpanded,
    } = props;
    const childExist = Array.isArray(folder.children) && folder.children.length > 0;

    return (
        <React.Fragment>
            <ObserverFolderItem
                id={folder.id}
                name={folder.name}
                childExist={childExist}
                isDisabled={isDisabled}
                isExpand={isExpanded}
                isSelected={selectedId === folder.id}
                level={level}
                onClick={() => onClick(folder)}
                onExpandChange={() => onChangeExpanded(folder.id)}
                onCreateSubFolder={onCreateSubFolder}
            />
            {childExist && (
                <Collapse in={isExpanded}>
                    <TreeLevel
                        data={folder.children}
                        expanded={expanded}
                        disabled={disabled}
                        level={level + 1}
                        selectedId={selectedId}
                        onClickFolder={onClick}
                        onCreateSubFolder={onCreateSubFolder}
                        onChangeExpanded={onChangeExpanded}
                    />
                </Collapse>
            )}
        </React.Fragment>
    );
}

function TreeLevel(props) {
    const {
        data,
        expanded = [],
        disabled = [],
        level,
        selectedId,
        onClickFolder,
        onCreateSubFolder,
        onChangeExpanded,
    } = props;

    return data.map((folder) => (
        <TreeItem
            key={folder.id}
            expanded={expanded}
            disabled={disabled}
            folder={folder}
            level={level}
            isDisabled={disabled.includes(folder.id)}
            isExpanded={expanded.includes(folder.id)}
            selectedId={selectedId}
            onClick={(selectFolder) => onClickFolder(selectFolder)}
            onChangeExpanded={onChangeExpanded}
            onCreateSubFolder={onCreateSubFolder}
        />
    ));
}

function Folders(props) {
    const {
        selectFolder,
        defaultExpanded = [],
        disabled: defaultDisabled = [],
        showRoot = false,
        onClickFolder,
    } = props;
    const classes = useStyles();
    const { t } = useTranslation(['folder', 'bookmark']);
    const bookmarksService = useBookmarksService();
    const store = useLocalObservable(() => ({
        tree: [],
        anchorEl: null,
        state: FETCH.WAIT,
        expanded: defaultExpanded,
        disabled: defaultDisabled,
    }));

    useEffect(() => {
        store.state = FETCH.PENDING;

        asyncAction(async () => {
            const path = selectFolder ? await FoldersUniversalService.getPath(selectFolder) : [];
            const tree = await FoldersUniversalService.getTree();

            store.expanded = [...store.expanded, ...path.map(({ id }) => id).slice(0, -1)];
            store.tree = tree;
            store.state = FETCH.DONE;
        }).catch((error) => {
            console.error(error);
            captureException(error);
            store.state = FETCH.FAILED;
        });
    }, [bookmarksService.lastTruthSearchTimestamp]);

    console.log('selectFolder:', selectFolder);

    return (
        <Box>
            <List disablePadding>
                {showRoot && (
                    <ListItem
                        className={classes.addRootButton}
                        onClick={async () => {
                            onClickFolder({ id: 0 });
                        }}
                        button
                        selected={selectFolder === 0}
                    >
                        <HomeIcon />
                        {t('folder:root')}
                    </ListItem>
                )}
                {(store.state === FETCH.DONE || store.state === FETCH.PENDING) && (
                    <TreeLevel
                        data={store.tree}
                        expanded={store.expanded}
                        disabled={store.disabled}
                        level={0}
                        selectedId={selectFolder}
                        onClickFolder={onClickFolder}
                        onCreateSubFolder={({ anchorEl, parentFolder }) => {
                            store.anchorEl = anchorEl;
                            store.parentFolder = parentFolder;
                        }}
                        onChangeExpanded={(folderId) => {
                            if (store.expanded.includes(folderId)) {
                                store.expanded = store.expanded.filter((id) => id !== folderId);
                            } else {
                                store.expanded = [...store.expanded, folderId];
                            }
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
                    selected={store.parentFolder === 0 && store.anchorEl}
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
                onSave={(folderId) => {
                    store.expanded = [...store.expanded, store.parentFolder];
                    store.anchorEl = null;
                    store.parentFolder = null;

                    FoldersUniversalService.get(folderId)
                        .then(onClickFolder);
                }}
                parentId={store.parentFolder}
                placement="left"
            />
        </Box>
    );
}

export default observer(Folders);
