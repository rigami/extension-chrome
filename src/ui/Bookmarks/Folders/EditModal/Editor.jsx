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
import useBookmarksService from '@/stores/app/BookmarksProvider';
import asyncAction from '@/utils/asyncAction';
import { toJS } from 'mobx';
import FoldersUniversalService from '@/stores/universal/bookmarks/folders';

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
    const { t } = useTranslation(['folder']);
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

    return (
        <TextField
            margin="dense"
            variant="outlined"
            fullWidth
            value={store.value}
            autoFocus
            error={store.error}
            helperText={store.error ? t('editor.error.alreadyExist') : ''}
            onChange={(event) => {
                store.value = event.target.value;
                store.error = store.level.indexOf(store.value.trim()) !== -1;
                onError(store.error);
            }}
            onBlur={() => handleSave()}
            onKeyDown={(event) => {
                if (event.code === 'Enter') handleSave();
            }}
        />
    );
}

const ObserverFolderEditor = observer(FolderEditor);

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
    const { t } = useTranslation(['folder']);
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

    const handleCreateNewFolder = (parentId) => {
        let createParentId = parentId;
        if (!isFinite(parentId)) {
            if (store.expanded.indexOf(store.folderId) === -1) {
                store.expanded.push(store.folderId);
            }
            createParentId = store.folderId;
        }

        FoldersUniversalService.getFoldersByParent(createParentId).then((folders) => {
            const folderNames = folders.map(({ name }) => name);
            let newFolderName = t('defaultName');
            let count = 1;

            while (folderNames.indexOf(newFolderName) !== -1) {
                count += 1;
                newFolderName = `${t('defaultName')} ${count}`;
            }
            store.newFolderRoot = createParentId;
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

            await FoldersUniversalService.getTree()
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
    };

    const renderTree = (nodes, parentLevel) => (
        <TreeItem
            key={nodes.id}
            nodeId={nodes.id}
            label={
                store.editId === nodes.id ? (
                    <ObserverFolderEditor
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
                ...(
                    Array.isArray(nodes.children)
                        ? nodes.children.map((node) => renderTree(node, nodes.children))
                        : []
                ),
                store.newFolderRoot === nodes.id && !store.editId ? (
                    <ObserverFolderEditor
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

    useEffect(() => {
        asyncAction(async () => {
            if (editId || selectId) {
                store.expanded = (await FoldersUniversalService.getPath(editId || selectId)).map(({ id }) => id);
            }
            const tree = editRootFolders
                ? await FoldersUniversalService.getFoldersByParent()
                : await FoldersUniversalService.getTree();
            if (editId) {
                const folder = await FoldersUniversalService.get(editId);
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
            <DialogTitle>{t('editor', { context: 'select' })}</DialogTitle>
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
                            <ObserverFolderEditor
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
                <Button
                    data-ui-path="folder.editor.newFolder"
                    onClick={() => handleCreateNewFolder(0)}
                    className={classes.createNewFolderButton}
                    disabled={!store.folderId}
                >
                    {t('editor.button.create')}
                </Button>
            </DialogContent>
            <DialogActions>
                <Button
                    data-ui-path="folder.editor.newFolder"
                    onClick={handleCreateNewFolder}
                    className={classes.createNewFolderButton}
                    disabled={!store.folderId}
                >
                    {t('editor.button.create')}
                </Button>
                <Button
                    data-ui-path="folder.editor.cancel"
                    onClick={onCancel}
                >
                    {t('common:button.cancel')}
                </Button>
                <Button
                    data-ui-path="folder.editor.save"
                    onClick={handleSave}
                    color="primary"
                    variant="contained"
                    disabled={store.error}
                >
                    {t('common:button.save')}
                </Button>
            </DialogActions>
        </Card>
    );
}

export default observer(Editor);
