import React, { useEffect, useState } from 'react';
import {
    Card,
    InputBase,
    Button,
    Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import { useTranslation } from 'react-i18next';
import TagsUniversalService from '@/stores/universal/bookmarks/tags';

const useStyles = makeStyles((theme) => ({
    popper: {
        display: 'flex',
        flexDirection: 'column',
    },
    input: { padding: theme.spacing(2) },
    saveButton: { marginRight: theme.spacing(2) },
    errorMessage: { padding: theme.spacing(1, 2) },
}));

function Editor({ onSave, onError, editId }) {
    const classes = useStyles();
    const { t } = useTranslation(['tag']);
    const [tagName, setTagName] = useState('');
    const [error, setError] = useState(null);
    const bookmarksService = useBookmarksService();
    const [editTag, setEditTag] = useState();
    const [isLoading, setIsLoading] = useState(Boolean(editId));

    const handlerSubmit = (event) => {
        event.preventDefault();
        if (tagName.trim() !== '') {
            bookmarksService.tags.save({
                name: tagName,
                id: editId,
            })
                .then((tagId) => onSave(tagId))
                .catch((e) => {
                    onError(e.message);
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
            .catch(console.error);
    }, []);

    return !isLoading && (
        <Card className={classes.popper} elevation={16}>
            <form onSubmit={handlerSubmit}>
                <InputBase
                    className={classes.input}
                    placeholder={t('editor.name', { context: 'placeholder' })}
                    variant="outlined"
                    autoFocus
                    defaultValue={editTag?.name}
                    onChange={(event) => {
                        setTagName(event.target.value);
                        onError(null);
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
        </Card>
    );
}

export default Editor;
