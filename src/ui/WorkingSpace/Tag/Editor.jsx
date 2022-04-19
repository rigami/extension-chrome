import React, { useEffect, useState } from 'react';
import {
    InputBase,
    Button,
    Typography,
    Box,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { captureException } from '@sentry/react';
import { useWorkingSpaceService } from '@/stores/app/workingSpace';
import TagsUniversalService from '@/stores/universal/workingSpace/tags';

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

function Editor({ onSave, editId }) {
    const classes = useStyles();
    const { t } = useTranslation(['tag']);
    const [tagName, setTagName] = useState('');
    const [error, setError] = useState(null);
    const workingSpaceService = useWorkingSpaceService();
    const [editTag, setEditTag] = useState();
    const [isLoading, setIsLoading] = useState(Boolean(editId));

    const handlerSubmit = (event) => {
        event.preventDefault();
        if (tagName.trim() !== '') {
            workingSpaceService.tags.save({
                name: tagName,
                id: editId,
            })
                .then((tagId) => onSave(tagId))
                .catch((e) => {
                    captureException(e);
                    setError(e.message);
                });
        }
    };

    useEffect(() => {
        if (!editId) return;

        TagsUniversalService.get(editId)
            .then((tag) => {
                setEditTag(tag);
                setIsLoading(false);
            })
            .catch((e) => {
                console.error(e);
                captureException(e);
            });
    }, []);

    return !isLoading && (
        <Box>
            <form onSubmit={handlerSubmit} className={classes.form}>
                <InputBase
                    className={classes.input}
                    placeholder={t('editor.name', { context: 'placeholder' })}
                    variant="outlined"
                    autoFocus
                    defaultValue={editTag?.name}
                    onChange={(event) => {
                        setTagName(event.target.value);
                        setError(null);
                    }}
                />
                <Button
                    data-ui-path="tag.editor.save"
                    className={classes.saveButton}
                    onClick={handlerSubmit}
                    variant="contained"
                    color="primary"
                    type="submit"
                >
                    {editId ? t('common:button.save') : t('common:button.add')}
                </Button>
            </form>
            {error && (
                <Typography className={classes.errorMessage} variant="body2" color="error">
                    {t(`editor.error.${error}`, 'editor.error.unknown')}
                </Typography>
            )}
        </Box>
    );
}

export default Editor;
