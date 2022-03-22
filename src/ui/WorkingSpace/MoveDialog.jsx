import React, { useEffect, useState } from 'react';
import { Button, Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import { PopoverDialogHeader } from '@/ui-components/PopoverDialog';
import BookmarksUniversalService from '@/stores/universal/bookmarks/bookmarks';
import FoldersUniversalService from '@/stores/universal/bookmarks/folders';
import Folders from '@/ui/WorkingSpace/Folders';
import { useWorkingSpaceService } from '@/stores/app/workingSpace';
import asyncAction from '@/utils/helpers/asyncAction';

const useStyles = makeStyles((theme) => ({
    dialog: {
        width: 300,
        minHeight: 400,
        margin: 0,
    },
    folders: {
        padding: theme.spacing(0.5),
    },
    headerButton: {
        borderRadius: theme.shape.borderRadiusButton
    },
}));

function MoveDialog(props) {
    const {
        itemType,
        itemId,
        itemParentId,
        moveId: defaultMoveId,
        onMove,
    } = props;
    const classes = useStyles();
    const { t } = useTranslation(['folder']);
    const bookmarksStore = useWorkingSpaceService();
    const [moveId, setMoveId] = useState(defaultMoveId);
    const [resetMoveId, setDefaultMoveId] = useState();

    const move = async (id) => {
        if (itemType === 'bookmark') {
            const bookmark = await BookmarksUniversalService.get(itemId);
            bookmarksStore.bookmarks.save({
                ...bookmark,
                folderId: id,
            });
        }
        if (itemType === 'folder') {
            const folder = await FoldersUniversalService.get(itemId);
            bookmarksStore.folders.save({
                ...folder,
                parentId: id,
            });
        }
    }

    useEffect(() => {
        asyncAction(async () => {
            if (defaultMoveId) return setDefaultMoveId(defaultMoveId);

            if (itemType === 'bookmark') {
                const bookmark = await BookmarksUniversalService.get(itemId);

                setDefaultMoveId(bookmark.folderId)
            }
            if (itemType === 'folder') {
                const folder = await FoldersUniversalService.get(itemId);

                setDefaultMoveId(folder.parentId)
            }
        })
    }, []);

    return (
        <Box className={classes.dialog}>
            <PopoverDialogHeader
                title={t('folder:editor', { context: 'select' })}
                action={(
                    <Button
                        className={classes.headerButton}
                        data-ui-path={`dialog.${itemType}.moveBack`}
                        disabled={itemId === moveId && itemType === 'folder'}
                        onClick={async () => {
                            await move(resetMoveId);

                            onMove?.(resetMoveId);
                        }}
                        color="primary"
                        autoFocus
                    >
                        {t('common:button.cancel')}
                    </Button>
                )}
            />
            <Folders
                className={classes.folders}
                showRoot={itemType === 'folder'}
                selectFolder={moveId}
                disabled={itemType === 'folder' ? [itemId] : []}
                defaultExpanded={itemType === 'folder' ? [itemParentId] : [moveId]}
                onClickFolder={async ({ id }) => {
                    setMoveId(id);
                    await move(id)
                }}
            />
        </Box>
    );
}

export default MoveDialog;
