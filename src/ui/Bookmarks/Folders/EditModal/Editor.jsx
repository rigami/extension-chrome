import React, { useEffect } from 'react';
import {
    Button,
    Card,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { TreeItem, TreeView } from '@material-ui/lab';
import {
    ChevronRightRounded as ArrowRightIcon,
    ExpandMoreRounded as ArrowDownIcon,
} from '@material-ui/icons';
import { useLocalObservable, observer } from 'mobx-react-lite';
import useBookmarksService from '@/stores/BookmarksProvider';
import asyncAction from '@/utils/asyncAction';
import { toJS } from 'mobx';

const useStyles = makeStyles((theme) => ({
    popper: {
        display: 'flex',
        flexDirection: 'column',
    },
    input: { padding: theme.spacing(2) },
    saveButton: { marginRight: theme.spacing(2) },
    errorMessage: { padding: theme.spacing(1, 2) },
    tree: {
        height: 230,
        width: 400,
        overflow: 'auto',
    },
    createNewFolderButton: { marginRight: 'auto' },
}));

function FolderEditor({ value, nodesLevel, onSave, onError }) {
    const { t } = useTranslation();
    const store = useLocalObservable(() => ({
        value,
        error: false,
        level: nodesLevel.map(({ name }) => name),
    }));

    const handleSave = () => {
        if (store.error) return;
        onSave(store.value);
    };

    useEffect(() => {
        store.value = value;
    }, [value]);

    return useObserver(() => (
        <TextField
            margin="dense"
            variant="outlined"
            fullWidth
            value={store.value}
            autoFocus
            error={store.error}
            helperText={store.error ? t('folder.editor.folderAlreadyExist') : ''}
            onChange={(event) => {
                store.value = event.target.value;
                console.log(toJS(store.level), store.level.indexOf(store.value))
                store.error = store.level.indexOf(store.value.trim()) !== -1;
                onError(store.error);
            }}
            onBlur={() => handleSave()}
            onKeyDown={(event) => {
                if (event.code === 'Enter') handleSave();
            }}
        />
    ));
}

function Editor(props) {
    const {
        editId,
        selectId,
        editRootFolders = false,
        addNewFolderByParentId = false,
        onSave,
        onCancel,
    } = props;
    const classes = useStyles();
    const { t } = useTranslation();
    const bookmarksService = useBookmarksService();
    const foldersService = bookmarksService.folders;
    const store = useLocalObservable(() => ({
        expanded: editId ? [editId] : [],
        folderId: editId || selectId || null,
        editId,
        newFolderRoot: false,
        newFolderName: '',
        folders: null,
        forceSave: false,
        error: false,
    }));

    const handleCreateNewFolder = () => {
        if (store.expanded.indexOf(store.folderId) === -1) {
            store.expanded.push(store.folderId);
        }

        bookmarksService.folders.getFoldersByParent(store.folderId).then((folders) => {
            const folderNames = folders.map(({ name }) => name);
            let newFolderName = t('folder.editor.defaultFolderName');
            let count = 1;

            while (folderNames.indexOf(newFolderName) !== -1) {
                count += 1;
                newFolderName = `${t('folder.editor.defaultFolderName')} ${count}`;
            }
            store.newFolderRoot = store.folderId;
            store.newFolderName = newFolderName;
        });
    };

    const handleSaveNewFolder = async (name, forceSave = false) => {
        store.newFolderName = name;
        if (store.forceSave && !forceSave) return;

        if (store.newFolderName.trim() !== '') {
            const newFolderId = await foldersService.save({
                name: store.newFolderName,
                parentId: store.newFolderRoot,
                id: store.editId,
            });

            await foldersService.getTree()
                .then((folders) => {
                    store.folders = folders;
                    store.folderId = newFolderId;
                });
        }

        store.newFolderRoot = null;
        store.editId = null;
    };

    const handleSave = async () => {
        store.forceSave = true;
        if (store.newFolderRoot !== null) {
            await handleSaveNewFolder(true);
        }
        store.forceSave = false;
        onSave(store.folderId);
    }

    const renderTree = (nodes, parentLevel) => {
        return (
            <TreeItem
                key={nodes.id}
                nodeId={nodes.id}
                label={
                    store.editId === nodes.id ? (
                        <FolderEditor
                            value={store.newFolderName}
                            onSave={handleSaveNewFolder}
                            nodesLevel={parentLevel}
                            onError={(isError) => {
                                store.error = isError;
                            }}

                        />
                    ) : nodes.name
                }
            >
                {[
                    ...(Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node, nodes.children)) : []),
                    store.newFolderRoot === nodes.id && !store.editId ? (
                        <FolderEditor
                            value={store.newFolderName}
                            onSave={handleSaveNewFolder}
                            nodesLevel={nodes.children}
                            onError={(isError) => {
                                store.error = isError;
                            }}
                        />
                    ) : null,
                ].filter((item) => item)}
            </TreeItem>
        );
    };

    useEffect(() => {
        asyncAction(async () => {
            if (editId || selectId) {
                store.expanded = (await foldersService.getPath(editId || selectId)).map(({ id }) => id);
            }
            const tree = editRootFolders ? await foldersService.getFoldersByParent() : await foldersService.getTree();
            if (editId) {
                const folder = await foldersService.get(editId);
                store.newFolderName = folder.name;
                store.newFolderRoot = folder.parentId;
            }
            store.folders = tree;
        });

        if (addNewFolderByParentId !== false) {
            store.folderId = addNewFolderByParentId;
            handleCreateNewFolder();
        }
    }, []);

    return (
        <Card className={classes.popper} elevation={16}>
            <DialogTitle>{t('folder.editor.title')}</DialogTitle>
            <DialogContent className={classes.tree}>
                {store.folders && (
                    <TreeView
                        defaultCollapseIcon={<ArrowDownIcon />}
                        expanded={store.expanded}
                        selected={store.folderId}
                        defaultExpandIcon={<ArrowRightIcon />}
                        onNodeSelect={(event, nodeId) => { store.folderId = nodeId; }}
                        onNodeToggle={(event, nodes) => { store.expanded = nodes; }}
                    >
                        {[...store.folders].map((item) => renderTree(item))}
                        {store.newFolderRoot === 0 && (
                            <FolderEditor
                                value={store.newFolderName}
                                onSave={handleSaveNewFolder}
                                nodesLevel={store.folders}
                                onError={(isError) => {
                                    store.error = isError;
                                }}
                            />
                        )}
                    </TreeView>
                )}
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleCreateNewFolder}
                    className={classes.createNewFolderButton}
                    disabled={!store.folderId}
                >
                    {t('folder.editor.create')}
                </Button>
                <Button onClick={onCancel}>{t('cancel')}</Button>
                <Button
                    onClick={handleSave}
                    color="primary"
                    variant="contained"
                    disabled={store.error}
                >
                    {t('save')}
                </Button>
            </DialogActions>
        </Card>
    );
}

export default observer(Editor);
