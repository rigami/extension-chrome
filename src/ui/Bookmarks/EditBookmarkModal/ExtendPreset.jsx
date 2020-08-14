import React, { useEffect, useState } from 'react';
import {
    Container,
    Collapse,
    CircularProgress,
    Card,
    Box,
} from '@material-ui/core';
import { observer, useObserver, useLocalStore } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import { useService as useBookmarksService } from '@/stores/bookmarks';
import PreviewSelector, {PreviewSelectorToggleButton} from "./Preview/Selector";
import { getSiteInfo, getImageRecalc } from "@/utils/siteSearch";
import { FETCH, BKMS_VARIANT } from '@/enum';
import asyncAction from "@/utils/asyncAction";
import Scrollbar from "@/ui-components/CustomScroll";
import clsx from 'clsx';
import Editor from "@/ui/Bookmarks/EditBookmarkModal/Editor";
import ReactResizeDetector from 'react-resize-detector';
import Preview, {STAGE} from "@/ui/Bookmarks/EditBookmarkModal/Preview";
import SelectorWrapper from "@/ui/Bookmarks/EditBookmarkModal/Preview/SelectorWrapper";

const useStyles = makeStyles((theme) => ({
    container: {
        padding: theme.spacing(3),
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

function ExtendPreset({ onSave, onCancel, onErrorLoad, editBookmarkId, defaultUrl, className: externalClassName, classes: externalClasses = {}, bringToEditorHeight = false }) {
    const classes = useStyles();

    const bookmarksStore = useBookmarksService();
    const [controller, setController] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [state, setState] = useState(FETCH.PENDING);
    const store = useLocalStore(() => ({
        /*
        images: [],
        searchRequest: defaultUrl || '',
        blockResetSearch: false,
        editorHeight: 0,
        isSave: false,
        isSaving: false, */
        editBookmarkId,
        icoVariant: BKMS_VARIANT.SMALL,
        imageURL: null,
        name: '',
        description: '',
        useDescription: false,
        categories: [],
        fullCategories: [],
        url: defaultUrl || '',
        stage: STAGE.WAIT_REQUEST,
        saveStage: FETCH.WAIT,
        isOpenSelectorPreview: false,
    }));

    /* const handlerSave = () => {
        store.isSaving  = true;
        bookmarksStore.saveBookmark({
            ...store,
            image_url: store.imageURL,
            name: store.name.trim(),
            description: (store.useDescription && store.description?.trim()) || '',
            id: store.editBookmarkId,
        }).then((saveBookmarkId) => {
            store.isSave = true;
            store.isSaving = false;
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
        store.fullCategories = store.categories.map((categoryId) => bookmarksStore.getCategory(categoryId));
    }, [store.categories.length]); */

    /* if (isLoading) {
        return useObserver(() => (
            <CircularProgress />
        ));
    } */

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

        asyncAction(async () => {
            const siteData = await getSiteInfo(store.url, controller);

            if (store.editBookmarkId) {
                store.stage = STAGE.DONE;
                store.images = siteData.icons;
                return;
            }

            if (siteData.bestIcon?.score === 0) {
                try {
                    siteData.bestIcon = await getImageRecalc(siteData.bestIcon.name)
                } catch (e) {
                    store.stage = STAGE.DONE;
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
                store.stage = STAGE.DONE;
            })
            .catch(() => {

            });
    }, [store.url]);

    useEffect(() => {
        store.fullCategories = store.categories.map((categoryId) => bookmarksStore.getCategory(categoryId));
    }, [store.categories.length]);

    return useObserver(() => (
        <Scrollbar
            reverse
            style={{ height: bringToEditorHeight && store.editorHeight }}
            className={externalClasses.scrollWrapper}
        >
            <Container
                maxWidth={false}
                className={clsx(classes.container, externalClassName)}
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
                            // onErrorLoadImage={() => {}}
                        />
                        <Box display="flex" flexDirection="column">
                            <SelectorWrapper
                                isOpen={store.isOpenSelectorPreview}
                                name={store.name}
                                description={store.useDescription && store.description}
                                categories={store.fullCategories}
                                images={store.images}
                                minHeight={store.editorHeight}
                                onChange={console.log}
                                onClose={() => {
                                    console.log("CLOSE !");
                                    store.isOpenSelectorPreview = false;
                                }}
                            />
                            <Editor
                                isEdit={!!store.editBookmarkId}
                                searchRequest={store.searchRequest}
                                name={store.name}
                                description={store.description}
                                useDescription={store.useDescription}
                                categories={[]}
                                saveState={store.saveStage}
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
                                onSave={() => {}}
                                onCancel={onCancel}
                            />
                        </Box>
                    </Card>
                </ReactResizeDetector>
            </Container>
        </Scrollbar>
    ));
}

export default observer(ExtendPreset);
