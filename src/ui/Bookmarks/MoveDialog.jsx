import React, { useState } from 'react';
import { Button, Box } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import { PopoverDialogHeader } from '@/ui-components/PopoverDialog';
import { DriveFileMoveFilled as MoveIcon } from '@/icons';
import BookmarksUniversalService from '@/stores/universal/bookmarks/bookmarks';
import FoldersUniversalService from '@/stores/universal/bookmarks/folders';
import Folders from '@/ui/Bookmarks/Folders';
import { useWorkingSpaceService } from '@/stores/app/workingSpace';

const useStyles = makeStyles(() => ({
    dialog: {
        width: 300,
        minHeight: 400,
        margin: 0,
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

    return (
        <Box className={classes.dialog}>
            <PopoverDialogHeader
                title={t('folder:editor', { context: 'select' })}
                action={(
                    <Button
                        data-ui-path={`dialog.${itemType}.remove`}
                        endIcon={(<MoveIcon />)}
                        disabled={itemId === moveId && itemType === 'folder'}
                        onClick={async () => {
                            if (itemType === 'bookmark') {
                                const bookmark = await BookmarksUniversalService.get(itemId);
                                bookmarksStore.bookmarks.save({
                                    ...bookmark,
                                    folderId: moveId,
                                });

                                onMove?.(moveId);
                            }
                            if (itemType === 'folder') {
                                const folder = await FoldersUniversalService.get(itemId);
                                bookmarksStore.folders.save({
                                    ...folder,
                                    parentId: moveId,
                                });

                                onMove?.(itemId);
                            }
                        }}
                        color="primary"
                        autoFocus
                    >
                        {t('common:button.move')}
                    </Button>
                )}
            />
            <Folders
                showRoot={itemType === 'folder'}
                selectFolder={moveId}
                disabled={itemType === 'folder' ? [itemId] : []}
                defaultExpanded={itemType === 'folder' ? [itemParentId] : [moveId]}
                onClickFolder={({ id }) => {
                    setMoveId(id);
                }}
            />
        </Box>
    );
}

export default MoveDialog;
