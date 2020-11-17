import React, { useEffect, useState } from 'react';
import {
    Container,
    CircularProgress,
    Card,
    Box,
} from '@material-ui/core';
import { observer, useLocalObservable } from 'mobx-react-lite';
import { makeStyles } from '@material-ui/core/styles';
import useBookmarksService from '@/stores/BookmarksProvider';
import { getSiteInfo, getImageRecalc } from '@/utils/siteSearch';
import { FETCH, BKMS_VARIANT } from '@/enum';
import asyncAction from '@/utils/asyncAction';
import Scrollbar from '@/ui-components/CustomScroll';
import clsx from 'clsx';
import ReactResizeDetector from 'react-resize-detector';
import FieldsEditor from './FieldsEditor';
import { PreviewSelectorToggleButton } from './Preview/Selector';
import Preview, { STAGE } from './Preview';
import SelectorWrapper from './Preview/SelectorWrapper';

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
        overflow: 'auto',
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
        folderId: 1,
        fullCategories: [],
        url: defaultUrl || '',
        forceAdded: false,
        stage: STAGE.WAIT_REQUEST,
        saveStage: FETCH.WAIT,
        isOpenSelectorPreview: false,
        images: [],
        preFetchSiteData: null,
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

            store.imageURL = siteData.bestIcon?.url;
            store.icoVariant = siteData.bestIcon?.type;
            if (!store.forceAdded) store.url = siteData.url;
            store.images = siteData.icons;
            if (!store.forceAdded) store.name = store.name || siteData.name;
            store.description = store.description || siteData.description;
        })
            .then(() => {
                if (parseUrl === store.url) store.stage = STAGE.DONE;
            })
            .catch((e) => {
                if (e.code === 404) {
                    store.stage = STAGE.FAILED_PARSE_SITE;
                    store.imageURL = '';
                    store.icoVariant = BKMS_VARIANT.SYMBOL;
                    store.images = [];
                    // store.name = store.name || '';
                    store.stage = store.name ? STAGE.FAILED_PARSE_SITE : STAGE.WAIT_NAME;
                }
            });
    };

    useEffect(() => {
        if (!store.editBookmarkId) return;
        setIsLoading(true);

        bookmarksService.bookmarks.get(editBookmarkId)
            .then((bookmark) => {
                store.url = bookmark.url;
                store.name = bookmark.name;
                store.imageURL = bookmark.imageUrl;
                store.useDescription = !!bookmark.description?.trim();
                if (store.useDescription) store.description = bookmark.description;
                store.folderId = bookmark.folderId;
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
                                    imagesCount={store.images.filter(({ failedLoad }) => !failedLoad).length}
                                    isOpen={store.isOpenSelectorPreview}
                                    onOpen={() => { store.isOpenSelectorPreview = true; }}
                                    onClose={() => { store.isOpenSelectorPreview = false; }}
                                />
                            )}
                            onClickPreview={() => { store.isOpenSelectorPreview = true; }}
                            getNextValidImage={() => {
                                store.images = store.images.filter(({ url }) => url !== store.imageURL);

                                if (store.images.length === 0) {
                                    store.imageURL = null;
                                    store.icoVariant = BKMS_VARIANT.SYMBOL;

                                    return {
                                        url: store.imageURL,
                                        type: store.icoVariant,
                                    };
                                }

                                let maxScoreId = 0;

                                store.images.forEach(({ score }, id) => {
                                    if (store.images[maxScoreId].score < score) maxScoreId = id;
                                });

                                store.imageURL = store.images[maxScoreId].url;
                                store.icoVariant = store.images[maxScoreId].type;

                                console.log('Next image', store.images[maxScoreId]);

                                return store.images[maxScoreId];
                            }}
                        />
                        <Box display="flex" flexDirection="column" flexGrow={1} className={classes.fieldsWrapper}>
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
                                onFailedLoadImage={(imageUrl) => {
                                    console.log('onFailedLoadImage', imageUrl);
                                    store.images = store.images.map(({ url, ...other }) => {
                                        if (url === imageUrl) {
                                            return {
                                                url,
                                                ...other,
                                                failedLoad: true,
                                            };
                                        }

                                        return {
                                            url,
                                            ...other,
                                        };
                                    });
                                }}
                                onLoadImage={(imageUrl, data) => {
                                    console.log('onLoadImage', imageUrl, data);
                                    store.images = store.images.map(({ url, ...other }) => {
                                        if (url === imageUrl) {
                                            return {
                                                ...other,
                                                ...data,
                                                url: imageUrl,
                                            };
                                        }

                                        return {
                                            url,
                                            ...other,
                                        };
                                    });
                                }}
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
                        </Box>
                    </Card>
                </ReactResizeDetector>
            </Container>
        </Scrollbar>
    );
}

export default observer(Editor);
