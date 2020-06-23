import React, { useState, useEffect } from 'react';
import {
    Card,
    InputBase,
    Button,
    Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { useService as useBookmarksService } from '@/stores/bookmarks';

const useStyles = makeStyles((theme) => ({
    popper: {
        display: 'flex',
        flexDirection: 'column',
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
    },
    input: { padding: theme.spacing(2) },
    saveButton: { marginRight: theme.spacing(2) },
    errorMessage: {
        padding: theme.spacing(1, 2),
    },
}));

function EditCategory({ onSave, onError, editCategoryId }) {
    const classes = useStyles();
    const [categoryName, setCategoryName] = useState('');
    const [error, setError] = useState(null);
    const bookmarksStore = useBookmarksService();
    const categoryStore = bookmarksStore.getCategory(editCategoryId);

    const handlerSubmit = (event) => {
        event.preventDefault();
        if (categoryName.trim() !== '') {
            bookmarksStore.saveCategory(categoryName, editCategoryId)
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
                    placeholder="Категория"
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
                    Сохранить
                </Button>
            </form>
            {error && error === 'category_already_exist' && (
                <Typography className={classes.errorMessage} variant="body2" color="error">
                    Такая категория уже существует
                </Typography>
            )}
        </Card>
    );
}

export default EditCategory;
