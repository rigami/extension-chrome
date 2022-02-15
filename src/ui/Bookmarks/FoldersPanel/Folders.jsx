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
import { useLocalObservable, observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import { captureException } from '@sentry/react';
import clsx from 'clsx';
import { useWorkingSpaceService } from '@/stores/app/workingSpace';
import { FETCH } from '@/enum';
import FoldersUniversalService from '@/stores/universal/bookmarks/folders';
import EditFolderModal from '@/ui/Bookmarks/Folders/EditModal';
import asyncAction from '@/utils/helpers/asyncAction';
import { useContextMenuService } from '@/stores/app/contextMenu';
import { Item, ItemAction } from '@/ui/Bookmarks/FoldersPanel/Item';
import { NULL_UUID } from '@/utils/generate/uuid';
import { ContextMenuItem } from '@/stores/app/contextMenu/entities';
import { BookmarkAddRounded as AddBookmarkIcon } from '@/icons';

const useStyles = makeStyles((theme) => ({
    expandIcon: {
        borderRadius: theme.shape.borderRadius,
        padding: 2,
        marginRight: 'auto',
        '& svg': {
            width: 18,
            height: 18,
        },
    },
    disabledExpand: { color: theme.palette.action.disabled },
    addRootButton: {
        height: 30,
        color: theme.palette.text.secondary,
        paddingLeft: theme.spacing(0.75),
        paddingRight: theme.spacing(0.75),
        borderRadius: theme.shape.borderRadiusButton,
        fontSize: '0.9rem',
        fontWeight: 550,
        justifyContent: 'flex-start',
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
        marginLeft: theme.spacing(1),
        marginRight: 'auto',
        padding: theme.spacing(0.25),
        boxSizing: 'content-box',
    },
    folderItem: {
        '&:hover $addSubFolder': { display: 'flex' },
        '&:hover $userActions': { display: 'flex' },
    },
    addSubFolder: { display: 'none' },
    userActions: { display: 'none' },
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
        actions,
        onClick,
        onExpandChange,
        onCreateSubFolder,
    } = props;
    const classes = useStyles();
    const { t } = useTranslation(['folder', 'bookmark']);
    const rootRef = useRef();
    const workingSpaceService = useWorkingSpaceService();
    const { dispatchContextMenu } = useContextMenuService((baseContextMenu) => baseContextMenu({
        itemId: id,
        itemType: 'folder',
    }));
    const [isPin, setIsPin] = useState(workingSpaceService.findFavorite({
        itemId: id,
        itemType: 'folder',
    }));

    useEffect(() => {
        setIsPin(workingSpaceService.findFavorite({
            itemId: id,
            itemType: 'folder',
        }));
    }, [workingSpaceService.favorites.length]);

    return (
        <Item
            ref={rootRef}
            level={level}
            disabled={isDisabled}
            selected={isSelected}
            onContextMenu={dispatchContextMenu}
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
                    {isPin && (
                        <FavoriteIcon className={classes.favorite} />
                    )}
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
                    <Box className={classes.userActions}>
                        {actions && actions({
                            id,
                            name,
                            permanent: false,
                        })}
                    </Box>
                    <Box>
                        {actions && actions({
                            id,
                            name,
                            permanent: true,
                        })}
                    </Box>
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
        actions,
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
                actions={actions}
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
                        actions={actions}
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
        actions,
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
            actions={actions}
            onClick={(selectFolder) => onClickFolder(selectFolder)}
            onChangeExpanded={onChangeExpanded}
            onCreateSubFolder={onCreateSubFolder}
        />
    ));
}

function Folders(props) {
    const {
        rootFolder,
        selectFolder,
        defaultExpanded = [],
        disabled: defaultDisabled = [],
        showRoot = false,
        disableAdd = false,
        actions,
        onClickFolder,
        className: externalClassName,
        emptyRender,
    } = props;
    const classes = useStyles();
    const { t } = useTranslation(['folder', 'bookmark']);
    const workingSpaceService = useWorkingSpaceService();
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
            const tree = await FoldersUniversalService.getTree(rootFolder);

            store.expanded = [...store.expanded, ...path.map(({ id }) => id).slice(0, -1)];
            store.tree = tree;
            store.state = FETCH.DONE;
        }).catch((error) => {
            console.error(error);
            captureException(error);
            store.state = FETCH.FAILED;
        });
    }, [workingSpaceService.lastTruthSearchTimestamp]);

    console.log('selectFolder:', selectFolder);

    if (store.state !== FETCH.PENDING && store.state !== FETCH.WAIT && store.tree.length === 0 && emptyRender) {
        return emptyRender();
    }

    return (
        <Box className={externalClassName}>
            <List disablePadding>
                {showRoot && (
                    <ListItem
                        className={classes.addRootButton}
                        onClick={async () => {
                            onClickFolder({ id: NULL_UUID });
                        }}
                        button
                        selected={selectFolder === NULL_UUID}
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
                        actions={actions}
                    />
                )}
                {!disableAdd && (
                    <ListItem
                        className={classes.addRootButton}
                        onClick={(event) => {
                            store.anchorEl = event.currentTarget;
                            store.parentFolder = NULL_UUID;
                        }}
                        button
                        selected={store.parentFolder === NULL_UUID && store.anchorEl}
                    >
                        <AddIcon />
                        {t('button.create')}
                    </ListItem>
                )}
            </List>
            {!disableAdd && (
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
            )}
        </Box>
    );
}

export default observer(Folders);
