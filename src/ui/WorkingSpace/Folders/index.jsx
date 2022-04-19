import React, { useEffect } from 'react';
import { Box, List, ListItem } from '@material-ui/core';
import { AddRounded as AddIcon, HomeRounded as HomeIcon } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { useLocalObservable, observer } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import { captureException } from '@sentry/react';
import { useWorkingSpaceService } from '@/stores/app/workingSpace';
import { FETCH } from '@/enum';
import FoldersUniversalService from '@/stores/universal/workingSpace/folders';
import asyncAction from '@/utils/helpers/asyncAction';
import { NULL_UUID } from '@/utils/generate/uuid';
import TreeFolders from './TreeFolders';
import { useContextEdit } from '@/stores/app/contextActions';

const useStyles = makeStyles((theme) => ({
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
            marginRight: theme.spacing(0.75),
            width: 18,
            height: 18,
        },
    },
}));

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
    const { dispatchEdit, isOpen } = useContextEdit();

    const handleSave = (folderId) => {
        store.expanded = [...store.expanded, store.parentFolder];
        store.anchorEl = null;
        store.parentFolder = null;

        FoldersUniversalService.get(folderId)
            .then(onClickFolder);
    };

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
                    <TreeFolders
                        data={store.tree}
                        expanded={store.expanded}
                        disabled={store.disabled}
                        level={0}
                        selectedId={selectFolder}
                        onClickFolder={onClickFolder}
                        onCreateSubFolder={(parentFolder) => handleSave(parentFolder)}
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
                        onClick={(event) => dispatchEdit({
                            itemType: 'folder',
                            onSave: handleSave,
                        }, event)}
                        button
                        selected={isOpen}
                    >
                        <AddIcon />
                        {t('button.create')}
                    </ListItem>
                )}
            </List>
        </Box>
    );
}

export default observer(Folders);
