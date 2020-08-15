import React, { useEffect, useState } from 'react';
import {
    Container,
    CircularProgress,
    Card,
    Box,
} from '@material-ui/core';
import { observer, useObserver, useLocalStore } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import { useService as useBookmarksService } from '@/stores/bookmarks';
import {PreviewSelectorToggleButton} from "./Preview/Selector";
import { getSiteInfo, getImageRecalc } from "@/utils/siteSearch";
import { FETCH, BKMS_VARIANT } from '@/enum';
import asyncAction from "@/utils/asyncAction";
import Scrollbar from "@/ui-components/CustomScroll";
import clsx from 'clsx';
import FieldsEditor from "./FieldsEditor";
import ReactResizeDetector from 'react-resize-detector';
import Preview, {STAGE} from "./Preview";
import SelectorWrapper from "./Preview/SelectorWrapper";

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
    editor: {
        display: 'flex',
    },
}));

function Editor(props) {
    const {
        editBookmarkId,
        defaultUrl,
        defaultName,
        bringToEditorHeight = false,
        marginThreshold = 24,
        className: externalClassName,
        classes: externalClasses = {},
        onSave,
        onCancel,
        onErrorLoad,
    } = props;
    const classes = useStyles();

    const bookmarksStore = useBookmarksService();
    const [controller, setController] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const store = useLocalStore(() => ({
        editBookmarkId,
        editorHeight: 0,
        icoVariant: BKMS_VARIANT.SMALL,
        imageURL: null,
        name: defaultName || '',
        description: '',
        useDescription: false,
        categories: [],
        fullCategories: [],
        url: defaultUrl || '',
        stage: STAGE.WAIT_REQUEST,
        saveStage: FETCH.WAIT,
        isOpenSelectorPreview: false,
        images: [],
    }));

    const handlerSave = () => {
        store.saveStage  = FETCH.PENDING;
        bookmarksStore.saveBookmark({
            ...store,
            image_url: store.imageURL,
            name: store.name.trim(),
            description: (store.useDescription && store.description?.trim()) || '',
            id: store.editBookmarkId,
        }).then((saveBookmarkId) => {
            store.saveStage  = FETCH.DONE;
            store.editBookmarkId = saveBookmarkId;
        });

        onSave();
    };

    useEffect(() => {
        if (!store.editBookmarkId) return;
        setIsLoading(true);

        bookmarksStore.getBookmark(editBookmarkId)
            .then((bookmark) => {
                store.url = bookmark.url;
                store.name = bookmark.name;
                store.imageURL = bookmark.imageUrl;
                store.useDescription = !!bookmark.description?.trim();
                if (store.useDescription) store.description = bookmark.description;
                store.icoVariant = bookmark.icoVariant;
                store.categories = (bookmark.categories || []).map((category) => category.id);
                setIsLoading(false);
            })
            .catch((e) => {
                console.error(e);
                onErrorLoad(e);
            });
    }, []);

    useEffect(() => {
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

            if (store.editBookmarkId) {
                store.images = siteData.icons;
                return;
            }

            if (siteData.bestIcon?.score === 0) {
                try {
                    siteData.bestIcon = await getImageRecalc(siteData.bestIcon.name)
                } catch (e) {
                }
            }

            store.imageURL = siteData.bestIcon?.url;
            store.icoVariant = siteData.bestIcon?.type;
            store.url = siteData.url;
            store.searchRequest = siteData.url;
            store.images = siteData.icons;
            store.name = store.name || siteData.name;
            store.description = store.description || siteData.description;
        })
            .then(() => {
                if (parseUrl === store.url) store.stage = STAGE.DONE;
            })
            .catch(() => {

            });
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
        <Scrollbar
            reverse
            style={{ height: bringToEditorHeight && store.editorHeight }}
            className={externalClasses.scrollWrapper}
        >
            <Container
                maxWidth={false}
                className={clsx(classes.container, externalClassName)}
                style={{ padding: marginThreshold }}
            >

                <ReactResizeDetector
                    handleHeight
                    onResize={(width, height) => { store.editorHeight = height; }}
                >
                    <Card className={classes.editor}>
                        <Preview
                            stage={store.stage}
                            name={store.name}
                            imageUrl={store.imageURL}
                            icoVariant={store.icoVariant}
                            description={store.useDescription && store.description}
                            categories={store.fullCategories}
                            header={(
                                <PreviewSelectorToggleButton
                                    isOpen={store.isOpenSelectorPreview}
                                    onOpen={() => { store.isOpenSelectorPreview = true; }}
                                    onClose={() => { store.isOpenSelectorPreview = false; }}
                                />
                            )}
                            getNextValidImage={() => {
                                store.images = store.images.filter(({ url }) => url !== store.imageURL);

                                if(store.images.length === 0) {
                                    store.imageURL = null;
                                    store.icoVariant = BKMS_VARIANT.SYMBOL;

                                    return { url: store.imageURL, type: store.icoVariant };
                                }

                                let maxScoreId = 0;

                                store.images.forEach(({ score }, id) => {
                                    if (store.images[maxScoreId].score < score) maxScoreId = id;
                                });

                                store.imageURL = store.images[maxScoreId].url;
                                store.icoVariant = store.images[maxScoreId].type;

                                console.log('Next image', store.images[maxScoreId])

                                return store.images[maxScoreId];
                            }}
                        />
                        <Box display="flex" flexDirection="column">
                            <SelectorWrapper
                                isOpen={store.isOpenSelectorPreview}
                                name={store.name}
                                description={store.useDescription && store.description}
                                categories={store.fullCategories}
                                images={store.images}
                                minHeight={store.editorHeight}
                                marginThreshold={marginThreshold}
                                onSelect={(url, type) => {
                                    store.imageURL = url;
                                    store.icoVariant = type;
                                    store.isOpenSelectorPreview = false;
                                }}
                                onClose={() => {
                                    store.isOpenSelectorPreview = false;
                                }}
                            />
                            <FieldsEditor
                                isEdit={!!store.editBookmarkId}
                                searchRequest={store.searchRequest}
                                name={store.name}
                                description={store.description}
                                useDescription={store.useDescription}
                                categories={store.categories}
                                saveState={store.saveStage}
                                marginThreshold={marginThreshold}
                                onChangeFields={(value) => {
                                    if ('searchRequest' in value) {
                                        store.searchRequest = value.searchRequest;
                                        store.stage = value.searchRequest ? STAGE.WAIT_RESULT : STAGE.WAIT_REQUEST;
                                    }
                                    if ('url' in value) {
                                        store.searchRequest = value.url;
                                        store.url = value.url;
                                        store.stage = STAGE.WAIT_NAME;
                                    }
                                    if ('name' in value) {
                                        store.name = value.name;
                                        store.stage = value.name ? STAGE.DONE : STAGE.WAIT_NAME;
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
                                    store.saveStage = FETCH.WAIT;
                                }}
                                onSave={handlerSave}
                                onCancel={onCancel}
                            />
                        </Box>
                    </Card>
                </ReactResizeDetector>
            </Container>
        </Scrollbar>
    ));
}

export default observer(Editor);
