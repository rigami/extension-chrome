import React, { useEffect } from 'react';
import { InputBase, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { useLocalObservable, observer } from 'mobx-react-lite';
import { captureException } from '@sentry/react';
import FoldersUniversalService from '@/stores/universal/workingSpace/folders';
import { useWorkingSpaceService } from '@/stores/app/workingSpace';
import { NULL_UUID } from '@/utils/generate/uuid';

const useStyles = makeStyles((theme) => ({
    input: { padding: theme.spacing(1, 2) },
    saveButton: {
        margin: theme.spacing(0.5),
        marginLeft: theme.spacing(0),
        borderRadius: theme.shape.borderRadiusButton,
    },
    errorMessage: { padding: theme.spacing(1, 2) },
    form: {
        display: 'flex',
        alignItems: 'center',
    },
}));

function Editor({ onSave, editId, parentId = NULL_UUID }) {
    const classes = useStyles();
    const { t } = useTranslation(['folder']);
    const workingSpaceService = useWorkingSpaceService();
    // const { enqueueSnackbar } = useSnackbar();
    const foldersService = workingSpaceService.folders;
    const store = useLocalObservable(() => ({
        editId,
        parentId,
        name: '',
    }));

    const handlerSubmit = (event) => {
        event.preventDefault();
        if (store.name.trim() !== '') {
            foldersService.save({
                name: store.name,
                parentId: store.parentId,
                id: store.editId,
            })
                .then((folderId) => onSave?.(folderId))
                .catch((e) => {
                    captureException(e);
                    /* enqueueSnackbar({
                        message: t('editor.error.unknown'),
                        variant: 'error',
                    }); */
                });
        }
    };

    useEffect(() => {
        if (!editId) return;

        FoldersUniversalService.get(editId)
            .then((folder) => {
                store.name = folder.name;
                store.parentId = folder.parentId;
            });
    }, []);

    return (
        <form onSubmit={handlerSubmit} className={classes.form}>
            <InputBase
                className={classes.input}
                placeholder={t('editor.name', { context: 'placeholder' })}
                variant="outlined"
                autoFocus
                value={store.name}
                onChange={(event) => {
                    store.name = event.target.value;
                }}
            />
            <Button
                data-ui-path="folder.editor.newFolder.save"
                className={classes.saveButton}
                onClick={handlerSubmit}
                variant="contained"
                color="primary"
                type="submit"
            >
                {editId ? t('common:button.save') : t('common:button.create')}
            </Button>
        </form>
    );
}

export default observer(Editor);
