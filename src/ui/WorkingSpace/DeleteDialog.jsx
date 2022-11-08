import React from 'react';
import {
    Button,
    Box,
    DialogActions,
    Typography,
} from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import { PopoverDialogHeader } from '@/ui-components/PopoverDialog';
import { useWorkingSpaceService } from '@/stores/app/workingSpace';

const useStyles = makeStyles((theme) => ({
    dialog: {
        width: 400,
        margin: 0,
    },
    description: {
        padding: theme.spacing(1, 2),
        color: theme.palette.text.secondary,
    },
    deleteButton: { color: theme.palette.error.main },
}));

function DeleteDialog(props) {
    const {
        itemType,
        itemId,
        onDelete,
        onCancel,
    } = props;
    const classes = useStyles();
    const { t } = useTranslation(['folder']);
    const bookmarksStore = useWorkingSpaceService();

    return (
        <Box className={classes.dialog}>
            <PopoverDialogHeader title={t(`${itemType}:remove.confirm`)} />
            <Typography variant="body2" className={classes.description}>
                {t(`${itemType}:remove.confirm`, { context: 'description' })}
            </Typography>
            <DialogActions>
                <Button
                    data-ui-path={`dialog.${itemType}.cancelRemove`}
                    onClick={onCancel}
                    color="default"
                >
                    {t('common:button.cancel')}
                </Button>
                <Button
                    data-ui-path={`dialog.${itemType}.remove`}
                    onClick={() => {
                        if (itemType === 'bookmark') {
                            bookmarksStore.bookmarks.remove(itemId);
                        } else if (itemType === 'tag') {
                            bookmarksStore.tags.remove(itemId);
                        } else if (itemType === 'folder') {
                            bookmarksStore.folders.remove(itemId);
                        }
                        onDelete?.();
                    }}
                    className={classes.deleteButton}
                    autoFocus
                >
                    {t('common:button.remove')}
                </Button>
            </DialogActions>
        </Box>
    );
}

export default DeleteDialog;
