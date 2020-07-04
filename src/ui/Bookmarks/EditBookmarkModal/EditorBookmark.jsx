import React, { useEffect, useState } from 'react';
import {
    Button,
    Card,
    CardContent,
    Container,
    Typography,
    TextField,
    Collapse,
    CircularProgress,
} from '@material-ui/core';
import {
    AddRounded as AddIcon,
} from '@material-ui/icons';
import { observer, useObserver, useLocalStore } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import locale from '@/i18n/RU';
import { useService as useBookmarksService } from '@/stores/bookmarks';
import Categories from '../Ctegories';
import { useSnackbar } from 'notistack';
import SearchField from "@/ui/Bookmarks/EditBookmarkModal/SearchFiled";
import PreviewSelector from "./PreviewSelector";
import Preview from "./Preview";
import { getSiteInfo, getImageRecalc } from "@/utils/siteSearch";
import { FETCH, BKMS_VARIANT } from '@/enum'
import asyncAction from "@/utils/asyncAction";

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
    const { enqueueSnackbar } = useSnackbar();

    const bookmarksStore = useBookmarksService();
    const [controller, setController] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [state, setState] = useState(FETCH.PENDING);
    const store = useLocalStore(() => ({
        editBookmarkId,
        url: '',
        name: '',
        description: '',
        useDescription: false,
        icoVariant: BKMS_VARIANT.SMALL,
        categories: [],
        fullCategories: [],
        imageURL: null,
        images: [],
        isOpenSelectPreview: false,
    }));

    const handlerSave = () => {
        bookmarksStore.saveBookmark({
            ...store,
            image_url: store.imageURL,
            name: store.name.trim(),
            description: (store.useDescription && store.description?.trim()) || '',
            id: store.editBookmarkId,
        });

        onSave();
    };

    useEffect(() => {
        if (!editBookmarkId) return;
        setIsLoading(true);

        bookmarksStore.getBookmark(editBookmarkId)
            .then((bookmark) => {
                console.log("Bookmark", bookmark)
                store.url = bookmark.url;
                store.name = bookmark.name;
                store.imageURL = bookmark.imageUrl;
                store.useDescription = !!bookmark.description?.trim();
                if (store.useDescription) store.description = bookmark.description;
                store.type = bookmark.type;
                store.categories = (bookmark.categories || []).map((category) => category.id);
                setIsLoading(false);
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
            store.imageURL = null;
        }
        setState(FETCH.PENDING);

        if (controller) {
            controller.abort();
            setController(null);
        }

        if (store.url === '') {
            setState(FETCH.DONE);
            return;
        }

        asyncAction(async () => {
            const siteData = await getSiteInfo(store.url, controller);

            if (editBookmarkId) {
                setState(FETCH.DONE);
                store.images = siteData.icons;
                return;
            }

            if (siteData.bestIcon?.score === 0) {
                try {
                    siteData.bestIcon = await getImageRecalc(siteData.bestIcon.name)
                } catch (e) {
                    setState(FETCH.FAILED)
                }
            }

            store.imageURL = siteData.bestIcon?.url;
            store.icoVariant = siteData.bestIcon?.type;
            store.images = siteData.icons;
        })
            .then(() => setState(FETCH.DONE))
            .catch(() => setState(FETCH.FAILED));
    }, [store.url]);

    useEffect(() => {
        store.fullCategories = store.categories.map((categoryId) => bookmarksStore.getCategory(categoryId));
    }, [store.categories.length]);

    if (isLoading) {
        return useObserver(() => (
            <CircularProgress />
        ));
    }

    return useObserver(() => (
        <Container
            maxWidth={false}
            className={classes.container}
        >
            <Collapse in={store.isOpenSelectPreview} unmountOnExit>
                <PreviewSelector
                    name={store.name.trim()}
                    images={store.images}
                    description={store.useDescription && store.description?.trim()}
                    categories={store.fullCategories}
                    onChange={(imageUrl, icoVariant) => {
                        store.isOpenSelectPreview = false;
                        store.imageURL = imageUrl;
                        store.icoVariant = icoVariant;
                    }}
                />
            </Collapse>
            <Card className={classes.bgCardRoot} elevation={8}>
                <Preview
                    isOpen={store.isOpenSelectPreview}
                    state={state}
                    imageUrl={store.imageURL}
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
                                disabled={!store.url || !store.name.trim() || !store.imageURL}
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
