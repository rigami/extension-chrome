import React, { useEffect, useState } from 'react';
import {
    Container,
    Collapse,
    CircularProgress,
} from '@material-ui/core';
import { observer, useObserver, useLocalStore } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import { useService as useBookmarksService } from '@/stores/bookmarks';
import PreviewSelector from "./PreviewSelector";
import SearchResults from "./SearchResults";
import { getSiteInfo, getImageRecalc } from "@/utils/siteSearch";
import { FETCH, BKMS_VARIANT } from '@/enum';
import asyncAction from "@/utils/asyncAction";
import Scrollbar from "@/ui-components/CustomScroll";
import clsx from 'clsx';
import Editor from "@/ui/Bookmarks/EditBookmarkModal/Editor";
import ReactResizeDetector from 'react-resize-detector';

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
}));

function EditorBookmark({ onSave, onCancel, onErrorLoad, editBookmarkId, className: externalClassName, bringToEditorHeight = false }) {
    const classes = useStyles();

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
        searchRequest: '',
        blockResetSearch: false,
        editorHeight: 0,
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
            store.url = siteData.url;
            store.searchRequest = siteData.url;
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
        <Scrollbar reverse style={{ height: bringToEditorHeight && store.editorHeight }}>
            <Container
                maxWidth={false}
                className={clsx(classes.container, externalClassName)}
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
                <SearchResults
                    searchRequest={(store.url === store.searchRequest) ? "" : store.searchRequest}
                    onSelect={({ url, title, description}, forceAdd) => {
                        store.url = url;
                        store.searchRequest = url;
                        store.name = title || store.name || '';
                        store.description = description || '';
                        if (forceAdd) {
                            store.imageURL = null;
                            store.icoVariant = BKMS_VARIANT.SYMBOL;
                        } else {
                            store.icoVariant = BKMS_VARIANT.SMALL;
                        }
                    }}
                    onClick={() => {
                        store.blockResetSearch = true;
                    }}
                />
                <ReactResizeDetector
                    handleHeight
                    onResize={(width, height) => {
                        store.editorHeight = height;
                    }}
                >
                    <Editor
                        editBookmarkId={editBookmarkId}
                        state={state}
                        onSave={handlerSave}
                        onCancel={onCancel}
                    />
                </ReactResizeDetector>
            </Container>
        </Scrollbar>
    ));
}

export default observer(EditorBookmark);
