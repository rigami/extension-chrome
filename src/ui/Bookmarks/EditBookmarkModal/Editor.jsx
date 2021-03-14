import React, { useEffect, useState } from 'react';
import {
    Container,
    CircularProgress,
    Card,
} from '@material-ui/core';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import useBookmarksService from '@/stores/app/BookmarksProvider';
import { getSiteInfo, getImageRecalc } from '@/utils/siteSearch';
import { FETCH, BKMS_VARIANT } from '@/enum';
import asyncAction from '@/utils/asyncAction';
import clsx from 'clsx';
import BookmarksUniversalService from '@/stores/universal/bookmarks/bookmarks';
import FieldsEditor from './FieldsEditor';
import Preview, { STAGE } from './Preview';

const useStyles = makeStyles((theme) => ({
    container: {
        maxWidth: 1062,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
    },
    content: { flex: '1 0 auto' },
    button: {
        marginRight: theme.spacing(2),
        position: 'relative',
    },
    editor: { display: 'flex' },
    fieldsWrapper: {
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1,
        overflow: 'auto',
    },
}));

function Editor(props) {
    const {
        editBookmarkId,
        defaultUrl,
        defaultName,
        defaultFolderId,
        bringToEditorHeight = false,
        marginThreshold = 24,
        className: externalClassName,
        classes: externalClasses = {},
        onSave,
        onCancel,
        onErrorLoad,
        onStage = () => {},
    } = props;
    const classes = useStyles();

    const bookmarksService = useBookmarksService();
    const [controller, setController] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const store = useLocalObservable(() => ({
        editBookmarkId,
        editorHeight: 0,
        icoVariant: BKMS_VARIANT.SMALL,
        imageURL: null,
        name: defaultName || '',
        description: '',
        useDescription: false,
        categories: [],
        folderId: defaultFolderId || 1,
        fullCategories: [],
        url: defaultUrl || '',
        forceAdded: false,
        stage: editBookmarkId ? STAGE.DONE : STAGE.WAIT_REQUEST,
        saveStage: FETCH.WAIT,
        isOpenSelectorPreview: false,
        images: [],
        preFetchSiteData: null,
        defaultImage: null,
        isChange: false,
    }));

    const handlerSave = () => {
        store.saveStage = FETCH.PENDING;
        bookmarksService.bookmarks.save({
            ...store,
            image_url: store.imageURL,
            name: store.name.trim(),
            description: (store.useDescription && store.description?.trim()) || '',
            id: store.editBookmarkId,
        }).then((saveBookmarkId) => {
            store.saveStage = FETCH.DONE;
            store.editBookmarkId = saveBookmarkId;
        });

        onSave();
    };

    const handleGetSiteInfo = () => {
        if (!store.editBookmarkId) {
            store.imageURL = null;
        }

        if (controller) {
            controller.abort();
            setController(null);
        }

        if (store.url === '') {
            return;
        }

        store.stage = STAGE.PARSING_SITE;

        const parseUrl = store.url;

        asyncAction(async () => {
            const siteData = await getSiteInfo(store.url, controller);

            console.log('siteData', siteData);

            if (store.editBookmarkId) {
                store.images = siteData.icons;
                return;
            }

            if (siteData.bestIcon?.score === 0) {
                try {
                    console.log('siteData.bestIcon.url', siteData.bestIcon.url);
                    siteData.bestIcon = await getImageRecalc(siteData.bestIcon.url);
                } catch (e) {
                    console.error(e);
                }
            }
            if (!store.forceAdded) store.url = siteData.url;
            store.images = [siteData.bestIcon, ...siteData.icons];
            if (!store.forceAdded) store.name = store.name || siteData.name;
            store.description = store.description || siteData.description;
        })
            .then(() => {
                if (parseUrl === store.url) store.stage = STAGE.DONE;
            })
            .catch((e) => {
                console.error('Failed getSiteInfo', e);
                if (!store.editBookmarkId) {
                    store.imageURL = '';
                    store.icoVariant = BKMS_VARIANT.SYMBOL;
                }
                store.images = [];
                // store.name = store.name || '';
                store.stage = store.name ? STAGE.FAILED_PARSE_SITE : STAGE.WAIT_NAME;
            });
    };

    useEffect(() => {
        if (!store.editBookmarkId) return;
        setIsLoading(true);

        BookmarksUniversalService.get(editBookmarkId)
            .then((bookmark) => {
                store.url = bookmark.url;
                store.name = bookmark.name;
                store.imageURL = bookmark.imageUrl;
                store.icoVariant = bookmark.icoVariant;
                store.useDescription = !!bookmark.description?.trim();
                if (store.useDescription) store.description = bookmark.description;
                store.folderId = bookmark.folderId;
                store.categories = (bookmark.categories || []).map((category) => category.id);
                store.defaultImage = {
                    url: bookmark.imageUrl,
                    icoVariant: bookmark.icoVariant,
                };
                setIsLoading(false);
            })
            .catch((e) => {
                console.error(e);
                onErrorLoad(e);
            });
    }, []);

    useEffect(() => {
        handleGetSiteInfo();
    }, [store.url]);

    useEffect(() => {
        store.fullCategories = store.categories.map((categoryId) => bookmarksService.categories.get(categoryId));
    }, [store.categories.length]);

    useEffect(() => onStage(store.stage), [store.stage]);

    if (isLoading) {
        return (
            <CircularProgress />
        );
    }

    return (
        <Container
            maxWidth={false}
            className={clsx(classes.container, externalClassName)}
            style={{ padding: marginThreshold }}
        >
            <Card className={classes.editor}>
                <Preview
                    stage={store.stage}
                    defaultImage={store.defaultImage}
                    name={store.name}
                    description={store.useDescription && store.description}
                    onClickPreview={({ url, icoVariant }) => {
                        console.log('Select preview', {
                            url,
                            icoVariant,
                        });
                        store.imageURL = url;
                        store.icoVariant = icoVariant;
                    }}
                    selectUrl={store.imageURL}
                    images={store.images}
                />
                <FieldsEditor
                    isEdit={!!store.editBookmarkId}
                    searchRequest={store.url}
                    name={store.name}
                    description={store.description}
                    useDescription={store.useDescription}
                    categories={store.categories}
                    folderId={store.folderId}
                    saveState={store.saveStage}
                    marginThreshold={marginThreshold}
                    onChangeFields={(value) => {
                        console.log('onChangeFields', value);

                        store.isChange = true;

                        if ('searchRequest' in value) {
                            store.stage = value.searchRequest ? STAGE.WAIT_RESULT : STAGE.WAIT_REQUEST;
                        }
                        if ('url' in value) {
                            store.url = value.url;
                            store.stage = STAGE.WAIT_NAME;
                        }
                        if ('forceAdded' in value) {
                            store.forceAdded = value.forceAdded;
                        }
                        if ('name' in value) {
                            store.name = value.name || store.name;
                            store.stage = store.name ? STAGE.DONE : STAGE.WAIT_NAME;
                        }
                        if ('description' in value) {
                            store.description = value.description;
                        }
                        if ('useDescription' in value) {
                            store.useDescription = value.useDescription;
                        }

                        if ('categories' in value) {
                            store.categories = value.categories;
                        }
                        if ('folderId' in value) {
                            store.folderId = value.folderId;
                        }
                        store.saveStage = FETCH.WAIT;

                        if ('icons' in value && 'bestIcon' in value) {
                            store.preFetchSiteData = value;
                            handleGetSiteInfo();
                        }
                    }}
                    onSave={handlerSave}
                    onCancel={onCancel}
                />
            </Card>
        </Container>
    );
}

export default observer(Editor);
