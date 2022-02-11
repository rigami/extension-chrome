import React, { useEffect, useState } from 'react';
import { Button } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import PopperDialog, { PopoverDialogHeader } from '@/ui-components/PopoverDialog';
import { DriveFileMoveFilled as MoveIcon } from '@/icons';
import BookmarksUniversalService from '@/stores/universal/bookmarks/bookmarks';
import FoldersUniversalService from '@/stores/universal/bookmarks/folders';
import Folders from '@/ui/Bookmarks/FoldersPanel/Folders';
import { useWorkingSpaceService } from '@/stores/app/workingSpace';
import { useCoreService } from '@/stores/app/core';

const useStyles = makeStyles((theme) => ({
    dialog: {
        width: 300,
        minHeight: 400,
        margin: 0,
    },
}));

function MoveDialog({ }) {
    const classes = useStyles();
    const { t } = useTranslation(['folder']);
    const bookmarksStore = useWorkingSpaceService();
    const coreService = useCoreService();
    const [open, setOpen] = useState(false);
    const [edit, setEdit] = useState(null);

    useEffect(() => {
        const localListeners = [
            coreService.localEventBus.on('bookmark/move', ({ id, folderId, position }) => {
                setOpen(true);
                setEdit({
                    type: 'bookmark',
                    id,
                    folderId,
                    position,
                    moveId: folderId,
                });
            }),
            coreService.localEventBus.on('folder/move', ({ id, position }) => {
                setOpen(true);
                setEdit({
                    type: 'folder',
                    id,
                    position,
                    moveId: id,
                });
            }),
        ];

        return () => {
            localListeners.forEach((listenerId) => coreService.localEventBus.removeListener(listenerId));
        };
    }, []);

    if (!edit) return null;

    return (
        <PopperDialog
            open={open}
            onClose={() => setOpen(false)}
            anchorReference="anchorPosition"
            transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            anchorPosition={edit.position}
            PaperProps={{ className: classes.dialog }}
        >
            <PopoverDialogHeader
                title={t('folder:editor', { context: 'select' })}
                action={(
                    <Button
                        data-ui-path={`dialog.${edit.type}.remove`}
                        endIcon={(<MoveIcon />)}
                        disabled={edit.id === edit.moveId && edit.type === 'folder'}
                        onClick={async () => {
                            if (edit.type === 'bookmark') {
                                const bookmark = await BookmarksUniversalService.get(edit.id);
                                bookmarksStore.bookmarks.save({
                                    ...bookmark,
                                    folderId: edit.moveId,
                                });
                            }
                            if (edit.type === 'folder') {
                                const folder = await FoldersUniversalService.get(edit.id);
                                bookmarksStore.folders.save({
                                    ...folder,
                                    parentId: edit.moveId,
                                });
                            }

                            setEdit(null);
                        }}
                        color="primary"
                        autoFocus
                    >
                        {t('common:button.move')}
                    </Button>
                )}
            />
            {edit && (
                <Folders
                    showRoot={edit.type === 'folder'}
                    selectFolder={edit.moveId}
                    disabled={edit.type === 'folder' ? [edit.id] : []}
                    defaultExpanded={edit.type === 'folder' ? [edit.parentId] : [edit.moveId]}
                    onClickFolder={({ id }) => {
                        setEdit({
                            ...edit,
                            moveId: id,
                        });
                    }}
                />
            )}
        </PopperDialog>
    );
}

export default MoveDialog;
