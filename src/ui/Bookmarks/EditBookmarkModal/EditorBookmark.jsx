import React, { useEffect } from 'react';
import {
    Button,
    Card,
    CardContent,
    CardMedia,
    Container,
    Typography,
    TextField,
    ButtonGroup,
} from '@material-ui/core';
import { AddRounded as AddIcon, LinkRounded as URLIcon } from '@material-ui/icons';
import { observer, useObserver, useLocalStore } from 'mobx-react-lite';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import locale from '@/i18n/RU';
import { useService as useBookmarksService } from '@/stores/bookmarks';
import CardLink from '@/ui/Bookmarks/CardLink';
import FullScreenStub from '@/ui-components/FullscreenStub';
import Categories from '../Ctegories';
import { useSnackbar } from 'notistack';

const { global: localeGlobal } = locale;

const useStyles = makeStyles((theme) => ({
    bgCardRoot: { display: 'flex' },
    content: { flex: '1 0 auto' },
    cover: {
        padding: theme.spacing(2),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexDirection: 'column',
        flexGrow: 0,
        flexShrink: 0,
        backgroundColor: theme.palette.grey[900],
        boxSizing: 'content-box',
        minWidth: 180,
    },
    typeSwitcher: { marginBottom: theme.spacing(2) },
    notSelectButton: { color: theme.palette.text.secondary },
    controls: {
        display: 'flex',
        alignItems: 'center',
        paddingLeft: theme.spacing(2),
        paddingBottom: theme.spacing(2),
        justifyContent: 'flex-end',
    },
    button: {
        marginRight: theme.spacing(2),
        position: 'relative',
    },
    details: {
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
    },
    input: { marginTop: theme.spacing(2) },
    chipContainer: { marginTop: theme.spacing(2) },
    addDescriptionButton: { marginTop: theme.spacing(2) },
}));

function BGPreview(props) {
    const {
        url,
        name,
        type,
        description,
        onChangeType,
    } = props;
    const classes = useStyles();

    return (
        <CardMedia
            className={classes.cover}
        >
            {/* <CircularProgress style={{ color: theme.palette.common.white }} /> */}
            {name && url && (
                <React.Fragment>
                    <ButtonGroup className={classes.typeSwitcher}>
                        <Button
                            className={type !== 'default' && classes.notSelectButton}
                            color={type === 'default' && 'primary'}
                            variant={type === 'default' && 'contained'}
                            onClick={() => onChangeType('default')}
                        >
                            Обычная
                        </Button>
                        <Button
                            className={type !== 'extend' && classes.notSelectButton}
                            color={type === 'extend' && 'primary'}
                            variant={type === 'extend' && 'contained'}
                            onClick={() => onChangeType('extend')}
                        >
                            Расширенная
                        </Button>
                    </ButtonGroup>
                    <CardLink
                        name={name}
                        description={description}
                        categories={[]}
                        type={type}
                    />
                </React.Fragment>
            )}
            {!url && (
                <FullScreenStub
                    iconRender={(renderProps) => (<URLIcon {...renderProps} />)}
                    description="Укажите адрес"
                />
            )}
            {!name && url && (
                <FullScreenStub
                    iconRender={(renderProps) => (<URLIcon {...renderProps} />)}
                    description="Дайте закладке имя"
                />
            )}
        </CardMedia>
    );
}

function EditorBookmark({ onSave, onCancel, editBookmarkId }) {
    const classes = useStyles();
    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();

    const bookmarksStore = useBookmarksService();
    const store = useLocalStore(() => ({
        editBookmarkId,
        url: '',
        name: '',
        description: null,
        type: 'default',
        categories: [],
    }));

    const handlerSave = () => {
        bookmarksStore.saveBookmark({
            ...store,
            id: store.editBookmarkId,
        })
            .then(() => onSave());
    };

    useEffect(() => {
        if (!editBookmarkId) return;

        bookmarksStore.getBookmark(editBookmarkId)
            .then((bookmark) => {
                store.url = bookmark.url;
                store.name = bookmark.name;
                if (!!bookmark.description?.trim()) store.description = bookmark.description;
                store.type = bookmark.type;
            })
            .catch((e) => {
                console.error(e);
                onCancel();
                enqueueSnackbar({
                    message: 'Ошибка загрузки данных закладки',
                    variant: 'error',
                });
            });
    }, []);

    return useObserver(() => (
        <Container
            maxWidth="md"
            style={{
                marginBottom: theme.spacing(3),
                marginTop: theme.spacing(3),
            }}
        >
            <Card className={classes.bgCardRoot} elevation={8}>
                <BGPreview
                    url={store.url !== ''}
                    name={store.name}
                    type={store.type}
                    description={store.description}
                    onChangeType={(newType) => { store.type = newType; }}
                />
                <div className={classes.details}>
                    <CardContent className={classes.content}>
                        <Typography component="h5" variant="h5">
                            {!store.editBookmarkId ? 'Добавление закладки' : 'Редактирование закладки'}
                        </Typography>
                        <TextField
                            label="URL адрес"
                            variant="outlined"
                            fullWidth
                            value={store.url}
                            className={classes.input}
                            onChange={(event) => { store.url = event.target.value.trim(); }}
                        />
                        <TextField
                            label="Название"
                            variant="outlined"
                            fullWidth
                            value={store.name}
                            className={classes.input}
                            onChange={(event) => { store.name = event.target.value.trim(); }}
                        />
                        <Categories
                            className={classes.chipContainer}
                            sortByPopular
                            onChange={(newCategories) => { store.categories = newCategories; }}
                            autoSelect
                        />
                        {store.description !== null && (
                            <TextField
                                label="Описание"
                                variant="outlined"
                                fullWidth
                                value={store.description}
                                className={classes.input}
                                multiline
                                rows={3}
                                rowsMax={3}
                                onChange={(event) => { store.description = event.target.value.trim(); }}
                            />
                        )}
                        {store.description === null && (
                            <Button
                                startIcon={<AddIcon />}
                                className={classes.addDescriptionButton}
                                onClick={() => { store.description = ''; }}
                            >
                                Добавить описание
                            </Button>
                        )}
                    </CardContent>
                    <div className={classes.controls}>
                        <Button
                            variant="text"
                            color="default"
                            className={classes.button}
                            onClick={onCancel}
                        >
                            {localeGlobal.cancel}
                        </Button>
                        <div className={classes.button}>
                            <Button
                                variant="contained"
                                color="primary"
                                disabled={!store.url || !store.name}
                                onClick={handlerSave}
                            >
                                Сохранить
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </Container>
    ));
}

export default observer(EditorBookmark);
