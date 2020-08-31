import React, { useState } from 'react';
import {
    Card,
    InputBase,
    Button,
    Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import useBookmarksService from '@/stores/BookmarksProvider';
import { useTranslation } from 'react-i18next';

const useStyles = makeStyles((theme) => ({
    popper: {
        display: 'flex',
        flexDirection: 'column',
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    input: { padding: theme.spacing(2) },
    saveButton: { marginRight: theme.spacing(2) },
    errorMessage: { padding: theme.spacing(1, 2) },
}));

function Editor({ onSave, onError, editCategoryId }) {
    const classes = useStyles();
    const { t } = useTranslation();
    const [categoryName, setCategoryName] = useState('');
    const [error, setError] = useState(null);
    const bookmarksService = useBookmarksService();
    const categoryStore = bookmarksService.categories.get(editCategoryId);

    const handlerSubmit = (event) => {
        event.preventDefault();
        if (categoryName.trim() !== '') {
            bookmarksService.categories.save({
                name: categoryName,
                id: editCategoryId,
            })
                .then((categoryId) => onSave(categoryId))
                .catch((e) => {
                    onError(e.message);
                    setError(e.message);
                });
        }
    };

    return (
        <Card className={classes.popper} elevation={16}>
            <form onSubmit={handlerSubmit}>
                <InputBase
                    className={classes.input}
                    placeholder={t('category.createPlaceholder')}
                    variant="outlined"
                    autoFocus
                    defaultValue={categoryStore?.name}
                    onChange={(event) => {
                        setCategoryName(event.target.value);
                        onError(null);
                        setError(null);
                    }}
                />
                <Button
                    className={classes.saveButton}
                    onClick={handlerSubmit}
                    variant="contained"
                    color="primary"
                    type="submit"
                >
                    {t('save')}
                </Button>
            </form>
            {error && error === 'category_already_exist' && (
                <Typography className={classes.errorMessage} variant="body2" color="error">
                    {t('category.categoryAlreadyExist')}
                </Typography>
            )}
        </Card>
    );
}

export default Editor;
