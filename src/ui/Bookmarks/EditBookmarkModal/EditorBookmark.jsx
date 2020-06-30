import React, { useEffect, useState } from 'react';
import {
    Button,
    Card,
    CardContent,
    Container,
    Typography,
    TextField,
} from '@material-ui/core';
import {
    AddRounded as AddIcon,
} from '@material-ui/icons';
import { observer, useObserver, useLocalStore } from 'mobx-react-lite';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import locale from '@/i18n/RU';
import { useService as useBookmarksService } from '@/stores/bookmarks';
import Categories from '../Ctegories';
import { useSnackbar } from 'notistack';
import SearchField from "@/ui/Bookmarks/EditBookmarkModal/SearchFiled";
import PreviewSelector from "./PreviewSelector";
import Preview from "./Preview";
import {getSiteInfo} from "@/utils/siteSearch";

const { global: localeGlobal } = locale;

const useStyles = makeStyles((theme) => ({
    container: {
        marginBottom: theme.spacing(3),
        marginTop: theme.spacing(3),
        maxWidth: 1044,
    },
    bgCardRoot: { display: 'flex' },
    content: { flex: '1 0 auto' },
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

function EditorBookmark({ onSave, onCancel, editBookmarkId }) {
    const classes = useStyles();
    const theme = useTheme();
    const { enqueueSnackbar } = useSnackbar();

    const bookmarksStore = useBookmarksService();
    const [controller, setController] = useState(null);
    const [state, setState] = useState('loading_images');
    const store = useLocalStore(() => ({
        editBookmarkId,
        url: '',
        name: '',
        description: '',
        useDescription: false,
        icoVariant: 'circle',
        categories: [],
        fullCategories: [],
        image: null,
        images: [],
        isOpenSelectPreview: false,
    }));

    const handlerSave = () => {
        bookmarksStore.saveBookmark({
            ...store,
            image_url: store.image,
            name: store.name.trim(),
            description: (store.useDescription && store.description?.trim()) || '',
            id: store.editBookmarkId,
        })
            .then(() => onSave());
    };

    useEffect(() => {
        if (!editBookmarkId) return;

        bookmarksStore.getBookmark(editBookmarkId)
            .then((bookmark) => {
                console.log("Bookmark", bookmark)
                store.url = bookmark.url;
                store.name = bookmark.name;
                store.image = bookmark.imageUrl;
                store.useDescription = !!bookmark.description?.trim();
                if (store.useDescription) store.description = bookmark.description;
                store.type = bookmark.type;
                store.categories = (bookmark.categories || []).map((category) => category.id);
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

    useEffect(() => {
        if (!editBookmarkId) {
            store.image = null;
        }
        setState('loading_images');

        if (controller) {
            controller.abort();
            setController(null);
        }

        if (store.url === '') {
            setState('done');
            return;
        }

        getSiteInfo(store.url, controller)
            .then((siteData) => {
                setState('done');
                if (!editBookmarkId) {
                    store.image = siteData.icons[0]?.url;
                }
                store.images = siteData.icons;
            })
            .catch(() => {
                setState('failed');
            });
    }, [store.url]);

    useEffect(() => {
        store.fullCategories = store.categories.map((categoryId) => bookmarksStore.getCategory(categoryId));
    }, [store.categories.length]);

    return useObserver(() => (
        <Container
            maxWidth={false}
            className={classes.container}
        >
            <PreviewSelector
                isOpen={store.isOpenSelectPreview}
                name={store.name.trim()}
                images={store.images}
                description={store.useDescription && store.description?.trim()}
                categories={store.fullCategories}
                onChange={(imageUrl, icoVariant) => {
                    store.isOpenSelectPreview = false;
                    store.image = imageUrl;
                    store.icoVariant = icoVariant;
                }}
            />
            <Card className={classes.bgCardRoot} elevation={8}>
                <Preview
                    isOpen={store.isOpenSelectPreview}
                    state={state === 'loading_images'}
                    imageUrl={store.image}
                    name={store.name.trim()}
                    icoVariant={store.icoVariant}
                    description={store.useDescription && store.description?.trim()}
                    categories={store.fullCategories}
                    onChangeType={() => { store.isOpenSelectPreview = !store.isOpenSelectPreview; }}
                />
                <div className={classes.details}>
                    <CardContent className={classes.content}>
                        <Typography component="h5" variant="h5">
                            {!store.editBookmarkId ? 'Добавление закладки' : 'Редактирование закладки'}
                        </Typography>
                        <SearchField
                            value={store.url}
                            className={classes.input}
                            autoFocus={!editBookmarkId}
                            onChange={(site) => {
                                store.url = site.url;
                                store.name = site.title || '';
                                store.description = site.description || '';
                            }}
                            forceFocus
                        />
                        <TextField
                            label="Название"
                            variant="outlined"
                            disabled={store.url === ''}
                            fullWidth
                            value={store.name}
                            className={classes.input}
                            onChange={(event) => { store.name = event.target.value; }}
                        />
                        <Categories
                            className={classes.chipContainer}
                            sortByPopular
                            value={store.categories}
                            onChange={(newCategories) => { store.categories = newCategories; }}
                            autoSelect
                        />
                        {store.useDescription && (
                            <TextField
                                label="Описание"
                                variant="outlined"
                                fullWidth
                                value={store.description}
                                className={classes.input}
                                disabled={store.url === ''}
                                multiline
                                rows={3}
                                rowsMax={3}
                                onChange={(event) => { store.description = event.target.value; }}
                            />
                        )}
                        {!store.useDescription && (
                            <Button
                                startIcon={<AddIcon />}
                                className={classes.addDescriptionButton}
                                onClick={() => { store.useDescription = true; }}
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
                                disabled={!store.url || !store.name.trim() || !store.image}
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
