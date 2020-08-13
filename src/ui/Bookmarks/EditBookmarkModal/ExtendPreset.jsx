import React, { useEffect, useState } from 'react';
import {
    Container,
    Collapse,
    CircularProgress,
    Card,
} from '@material-ui/core';
import { observer, useObserver, useLocalStore } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import { useService as useBookmarksService } from '@/stores/bookmarks';
import PreviewSelector from "./Preview/Selector";
import { getSiteInfo, getImageRecalc } from "@/utils/siteSearch";
import { FETCH, BKMS_VARIANT } from '@/enum';
import asyncAction from "@/utils/asyncAction";
import Scrollbar from "@/ui-components/CustomScroll";
import clsx from 'clsx';
import Editor from "@/ui/Bookmarks/EditBookmarkModal/Editor";
import ReactResizeDetector from 'react-resize-detector';
import Preview, {STAGE} from "@/ui/Bookmarks/EditBookmarkModal/Preview";

const useStyles = makeStyles((theme) => ({
    container: {
        padding: theme.spacing(3),
        maxWidth: 1044,
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
        /* editBookmarkId,
        url: defaultUrl || '',
        name: '',
        description: '',
        useDescription: false,
        icoVariant: BKMS_VARIANT.SMALL,
        categories: [],
        fullCategories: [],
        imageURL: null,
        images: [],
        isOpenSelectPreview: false,
        searchRequest: defaultUrl || '',
        blockResetSearch: false,
        editorHeight: 0,
        isSave: false,
        isSaving: false, */
        editBookmarkId,
        stage: STAGE.WAIT_REQUEST,
        saveStage: FETCH.WAIT,
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
        if (!store.editBookmarkId) {
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

            if (store.editBookmarkId) {
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
            store.url = siteData.url;
            store.searchRequest = siteData.url;
            store.images = siteData.icons;
        })
            .then(() => setState(FETCH.DONE))
            .catch(() => setState(FETCH.FAILED));
    }, [store.url]);

    useEffect(() => {
        store.fullCategories = store.categories.map((categoryId) => bookmarksStore.getCategory(categoryId));
    }, [store.categories.length]); */

    /* if (isLoading) {
        return useObserver(() => (
            <CircularProgress />
        ));
    } */

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
                    onResize={(width, height) => {
                        store.editorHeight = height;
                    }}
                >
                    <Card className={classes.editor}>
                        <Preview
                            stage={store.stage}
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
                                if ('name' in value) {
                                    store.name = value.name;
                                }
                                if ('description' in value) {
                                    store.description = value.description;
                                }
                                if ('useDescription' in value) {
                                    store.useDescription = value.useDescription;
                                }
                                store.saveStage = FETCH.WAIT;
                            }}
                            onSave={() => {}}
                            onCance={onCancel}
                        />
                    </Card>
                </ReactResizeDetector>
            </Container>
        </Scrollbar>
    ));
}

export default observer(ExtendPreset);
