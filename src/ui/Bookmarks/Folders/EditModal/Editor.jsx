import React, { useState } from 'react';
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
import { first } from 'lodash';
import { useLocalObservable, useObserver } from 'mobx-react-lite';

const useStyles = makeStyles((theme) => ({
    popper: {
        display: 'flex',
        flexDirection: 'column',
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    input: { padding: theme.spacing(2) },
    saveButton: { marginRight: theme.spacing(2) },
    errorMessage: { padding: theme.spacing(1, 2) },
    tree: {
        height: 280,
        width: 440,
        overflow: 'auto',
    },
    createNewFolderButton: {
        marginRight: 'auto',
    },
}));

const data = [
    {
        id: 'rigami',
        name: 'rigami',
    },
    {
        id: 'google-chrome',
        name: 'google-chrome',
    },
    {
        id: 'android',
        name: 'android',
    },
];

function Editor({ onSave, onError, onCancel, editCategoryId }) {
    const classes = useStyles();
    const { t } = useTranslation();
    const store = useLocalObservable(() => ({
        expanded: [first(data).id],
        folderId: first(data).id,
        newFolderRoot: false,
    }));

    const handleCreateNewFolder = () => {
        console.log(JSON.parse(JSON.stringify(store.expanded)))
        if (store.expanded.indexOf(store.folderId) === -1) {
            store.expanded.push(store.folderId)
        }

        store.newFolderRoot = store.folderId;
    }

    const handleSaveNewFolder = () => {
        store.newFolderRoot = null;
    }

    const renderTree = (nodes) => (
        <TreeItem key={nodes.id} nodeId={nodes.id} label={nodes.name}>
            {[
                ...(Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : []),
                store.newFolderRoot === nodes.id ? (
                    <TextField
                        margin="dense"
                        variant="outlined"
                        fullWidth
                        defaultValue="New folder"
                        autoFocus
                        onBlur={handleSaveNewFolder}
                    />
                ) : null
            ].filter((item) => item)}
        </TreeItem>
    );

    return useObserver(() => (
        <Card className={classes.popper} elevation={16}>
            <DialogTitle>{t('folder.editor.title')}</DialogTitle>
            <DialogContent>
                <TreeView
                    className={classes.tree}
                    defaultCollapseIcon={<ArrowDownIcon />}
                    expanded={store.expanded}
                    defaultExpandIcon={<ArrowRightIcon />}
                    onNodeSelect={(event, nodeId) => { store.folderId = nodeId; }}
                    onNodeToggle={(event, nodes) => { store.expanded = nodes }}
                >
                    {[...data].map((item) => renderTree(item))}
                </TreeView>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleCreateNewFolder}
                    className={classes.createNewFolderButton}
                >
                    {t('folder.editor.create')}
                </Button>
                <Button onClick={onCancel}>{t('cancel')}</Button>
                <Button color="primary" variant="contained">{t('save')}</Button>
            </DialogActions>
        </Card>
    ));
}

export default Editor;
