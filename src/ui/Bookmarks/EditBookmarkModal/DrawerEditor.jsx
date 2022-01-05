import React from 'react';
import { Button, Drawer } from '@material-ui/core';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import Editor from './Editor';
import PopperDialog, { PopoverDialogHeader } from '@/ui-components/PopoverDialog';
import { DriveFileMoveFilled as MoveIcon } from '@/icons';
import BookmarksUniversalService from '@/stores/universal/bookmarks/bookmarks';
import FoldersUniversalService from '@/stores/universal/bookmarks/folders';

const useStyles = makeStyles((theme) => ({
    dialog: {
        width: 690,
        minHeight: 400,
        margin: 0,
    },
}));

function EditBookmarkModal(props) {
    const {
        open,
        onClose,
        editBookmarkId,
        position = {},
        ...other
    } = props;
    const classes = useStyles();
    const { enqueueSnackbar } = useSnackbar();
    const { t } = useTranslation(['bookmark']);

    return (
        <PopperDialog
            open={open}
            onClose={onClose}
            anchorReference="anchorPosition"
            transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            anchorPosition={position}
            PaperProps={{ className: classes.dialog }}
        >
            <PopoverDialogHeader
                title={t('editor', { context: editBookmarkId ? 'edit' : 'add' })}
            />
            <Editor
                onSave={onClose}
                onCancel={onClose}
                onErrorLoad={() => {
                    enqueueSnackbar({
                        message: t('bookmark.errorLoad'),
                        variant: 'error',
                    });
                    onClose();
                }}
                editBookmarkId={editBookmarkId}
                {...other}
            />
        </PopperDialog>
    );
}

export default EditBookmarkModal;
