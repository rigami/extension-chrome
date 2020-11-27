import React, { useEffect } from 'react';
import {
    Button,
    Card,
    DialogActions,
    DialogTitle,
    DialogContent,
    TextField,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { TreeView, TreeItem } from '@material-ui/lab';
import {
    ExpandMoreRounded as ArrowDownIcon,
    ChevronRightRounded as ArrowRightIcon,
} from '@material-ui/icons';
import { useLocalObservable, useObserver } from 'mobx-react-lite';
import useBookmarksService from '@/stores/BookmarksProvider';
import asyncAction from '@/utils/asyncAction';

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

function Editor(props) {
    const {
        editId,
        selectId,
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
    }));

    const handleCreateNewFolder = () => {
        if (store.expanded.indexOf(store.folderId) === -1) {
            store.expanded.push(store.folderId);
        }

        store.newFolderName = t('folder.editor.defaultFolderName');
        store.newFolderRoot = store.folderId;
    };

    const handleSaveNewFolder = async () => {
        if (store.newFolderName.trim() !== '') {
            await foldersService.save({
                name: store.newFolderName,
                parentId: store.newFolderRoot,
                id: store.editId,
            });

            await foldersService.getTree()
                .then((folders) => {
                    store.folders = folders;
                });
        }

        store.newFolderRoot = null;
        store.editId = null;
    };

    const renderTree = (nodes) => (
        <TreeItem
            key={nodes.id}
            nodeId={nodes.id}
            label={
                store.editId === nodes.id ? (
                    <TextField
                        margin="dense"
                        variant="outlined"
                        fullWidth
                        value={store.newFolderName}
                        autoFocus
                        onChange={(event) => { store.newFolderName = event.target.value; }}
                        onBlur={handleSaveNewFolder}
                        onKeyDown={(event) => {
                            console.log('event.code', event.code);
                            if (event.code === 'Enter') handleSaveNewFolder();
                        }}
                    />
                ) : nodes.name
            }
        >
            {[
                ...(Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : []),
                store.newFolderRoot === nodes.id && !store.editId ? (
                    <TextField
                        margin="dense"
                        variant="outlined"
                        fullWidth
                        value={store.newFolderName}
                        autoFocus
                        onChange={(event) => { store.newFolderName = event.target.value; }}
                        onBlur={handleSaveNewFolder}
                        onKeyDown={(event) => {
                            console.log('event.code', event.code);
                            if (event.code === 'Enter') handleSaveNewFolder();
                        }}
                    />
                ) : null,
            ].filter((item) => item)}
        </TreeItem>
    );

    useEffect(() => {
        asyncAction(async () => {
            console.log('editId || selectId', editId, selectId)
            if (editId || selectId) {
                const path = (await foldersService.getPath(editId || selectId)).map(({ id }) => id);
                console.log('path', path)
                store.expanded = path;
            }
            const tree = await foldersService.getTree();
            console.log('tree', tree)
            if (editId) {
                const folder = await foldersService.get(editId);
                store.newFolderName = folder.name;
                store.newFolderRoot = folder.parentId;
            }
            store.folders = tree;
        });
    }, []);

    return useObserver(() => (
        <Card className={classes.popper} elevation={16}>
            <DialogTitle>{t('folder.editor.title')}</DialogTitle>
            <DialogContent className={classes.tree}>
                {store.folders && (
                    <TreeView
                        defaultCollapseIcon={<ArrowDownIcon />}
                        expanded={store.expanded}
                        defaultSelected={store.folderId}
                        defaultExpandIcon={<ArrowRightIcon />}
                        onNodeSelect={(event, nodeId) => { store.folderId = nodeId; }}
                        onNodeToggle={(event, nodes) => { store.expanded = nodes; }}
                    >
                        {[...store.folders].map((item) => renderTree(item))}
                    </TreeView>
                )}
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleCreateNewFolder}
                    className={classes.createNewFolderButton}
                >
                    {t('folder.editor.create')}
                </Button>
                <Button onClick={onCancel}>{t('cancel')}</Button>
                <Button
                    onClick={() => onSave(store.folderId)}
                    color="primary"
                    variant="contained"
                >
                    {t('save')}
                </Button>
            </DialogActions>
        </Card>
    ));
}

export default Editor;
