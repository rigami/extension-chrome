import React from 'react';
import {
    Button,
    Card,
    DialogActions,
    DialogContent,
    DialogTitle,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { useLocalObservable, observer } from 'mobx-react-lite';
import Folders from '@/ui/Bookmarks/FoldersPanel/Folders';
import { PopoverDialogHeader } from '@/ui-components/PopoverDialog';

const useStyles = makeStyles((theme) => ({
    popper: {
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'min(calc(100vh - 32px), 700px)',
    },
    tree: {
        width: 400,
        overflow: 'auto',
        padding: 0,
    },
    header: { padding: theme.spacing(1, 3.75) },
}));

function Editor(props) {
    const {
        selectId,
        onSave,
        onCancel,
    } = props;
    const classes = useStyles();
    const { t } = useTranslation(['folder']);
    const store = useLocalObservable(() => ({ folderId: selectId || null }));

    const handleSave = async () => {
        onSave(store.folderId);
    };

    return (
        <React.Fragment>
            <PopoverDialogHeader title={t('editor', { context: 'select' })} />
            <DialogContent className={classes.tree}>
                <Folders
                    selectFolder={store.folderId}
                    onClickFolder={({ id }) => {
                        store.folderId = id;
                    }}
                />
            </DialogContent>
            <DialogActions>
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
        </React.Fragment>
    );
}

export default observer(Editor);
