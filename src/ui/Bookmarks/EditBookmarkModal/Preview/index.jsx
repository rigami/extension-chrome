import React, { useEffect, Fragment, useCallback } from 'react';
import {
    CardMedia,
    Box,
    CircularProgress, Typography, Button, Collapse, Fade, Badge,
} from '@material-ui/core';
import { WarningRounded as WarnIcon, LinkRounded as URLIcon, DoneRounded as SelectIcon } from '@material-ui/icons';

import { makeStyles } from '@material-ui/core/styles';
import CardLink from '@/ui/Bookmarks/CardLink';
import Stub from '@/ui-components/Stub';
import { useTranslation } from 'react-i18next';
import { BKMS_VARIANT, FETCH } from '@/enum';
import { observer, useLocalObservable } from 'mobx-react-lite';
import Scrollbar from '@/ui-components/CustomScroll';
import clsx from 'clsx';
import ResizeDetector, { useResizeDetector } from 'react-resize-detector';
import { getNextImage } from '@/utils/checkIcons';
import asyncAction from '@/utils/asyncAction';
import { toJS } from 'mobx';

const useStyles = makeStyles((theme) => ({
    cover: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexDirection: 'column',
        flexGrow: 0,
        flexShrink: 0,
        backgroundColor: theme.palette.type === 'dark' ? theme.palette.grey[900] : theme.palette.grey[200],
        width: 182 + theme.spacing(4),
    },
    typeSwitcher: { marginBottom: theme.spacing(2) },
    warnMessage: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(1, 0),
        color: theme.palette.warning.main,
        marginTop: 'auto',
        wordBreak: 'break-word',
    },
    warnIcon: { marginRight: theme.spacing(1) },
    card: {
        margin: theme.spacing(2),
        marginBottom: 0,
    },
    bottomOffset: { marginBottom: theme.spacing(2) },
    shortList: {
        // marginTop: 'auto',
        transform: 'translateY(0px)',
        transition: '0.3s ease',
        minHeight: 200,
        paddingBottom: theme.spacing(2),
    },
    moreIcons: { marginTop: 'auto' },
    moreWrapper: {
        width: '100%',
        padding: theme.spacing(2),
        paddingBottom: 0,
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
    },
    helper: {
        position: 'absolute',
        width: '100%',
        textAlign: 'center',
        bottom: theme.spacing(2),
        zIndex: 1,
        fontFamily: theme.typography.primaryFontFamily,
        fontWeight: 600,
    },
    lockIconsList: {
        opacity: 0.5,
        pointerEvents: 'none',
    },
    trackY: {
        top: theme.spacing(2),
        right: (theme.spacing(2) - 4) / 2,
        bottom: theme.spacing(2),
        display: 'none',
    },
    thumbY: { backgroundColor: theme.palette.type === 'dark' ? theme.palette.grey[900] : theme.palette.grey[400] },
    activeCard: { borderColor: theme.palette.primary.main },
    badge: { '& svg': { fontSize: '1rem' } },
    badgePlace: { transform: 'scale(1) translate(30%, -40%)' },
    badgeInvisiblePlace: { transform: 'scale(0) translate(30%, -40%) !important' },
}));

const STAGE = {
    FAILED_PARSE_SITE: 'FAILED_PARSE_SITE',
    PARSING_SITE: 'PARSING_SITE',
    WAIT_REQUEST: 'WAIT_REQUEST',
    WAIT_RESULT: 'WAIT_RESULT',
    WAIT_NAME: 'WAIT_NAME',
    DONE: 'DONE',
};

function PreviewCard(props) {
    const {
        active,
        imageUrl,
        icoVariant,
        onClick,
        name,
        description,
        className: externalClassName,
    } = props;
    const classes = useStyles();

    return (
        <Badge
            invisible={!active}
            badgeContent={<SelectIcon />}
            color="primary"
            classes={{
                root: clsx(
                    classes.card,
                    externalClassName,
                ),
                badge: classes.badge,
                anchorOriginTopRightRectangle: classes.badgePlace,
                invisible: classes.badgeInvisiblePlace,
            }}
        >
            <CardLink
                name={name}
                description={description}
                icoVariant={icoVariant}
                imageUrl={imageUrl}
                preview
                onClick={() => onClick({
                    url: imageUrl,
                    icoVariant,
                })}
                className={clsx(active && classes.activeCard)}
            />
        </Badge>
    );
}

function Preview(props) {
    const {
        stage = STAGE.WAIT_REQUEST,
        defaultImage,
        selectUrl,
        name,
        description,
        images = [],
        // checkNextImage = () => {},
        onClickPreview,
    } = props;
    const classes = useStyles();
    const { t } = useTranslation(['bookmark']);
    const store = useLocalObservable(() => ({
        loadUrl: '',
        primaryImage: defaultImage || null,
        imagesDraftList: images,
        imagesShortList: [],
        imagesShortListState: FETCH.WAIT,
        imagesSecondList: [],
        imagesSecondListState: FETCH.WAIT,
        heightContainer: 0,
        heightCard: 0,
        lockIconsList: true,
        showShortList: false,
    }));

    const onResize = useCallback((width, height) => {
        store.heightContainer = height;
    }, []);

    const { ref } = useResizeDetector({ onResize });
    const { ref: listRef, height: listHeight } = useResizeDetector();

    const handleScrollStart = ({ scrollTop: scrollTopNow }, { scrollTop: scrollTopBefore }) => {
        if (store.imagesShortListState === FETCH.DONE && scrollTopNow - scrollTopBefore > 0) {
            store.lockIconsList = false;
        }
    };

    const loadPrimaryImage = async () => {
        do {
            store.primaryImage = await getNextImage(store.imagesDraftList, (list) => { store.imagesDraftList = list; });
        } while (!store.primaryImage && store.imagesDraftList.length !== 0);
    };

    const loadShortList = async () => {
        store.imagesShortListState = FETCH.PENDING;
        let img;

        do {
            img = await getNextImage(store.imagesDraftList, (list) => { store.imagesDraftList = list; });

            if (img) store.imagesShortList.push(img);
        } while (img && store.imagesShortList.length < 4 && store.imagesDraftList.length !== 0);

        store.imagesShortList.splice(1, 0, {
            url: '',
            icoVariant: BKMS_VARIANT.SYMBOL,
        });

        store.imagesShortListState = FETCH.DONE;
    };

    const handleLoadSecondList = async () => {
        store.imagesSecondListState = FETCH.PENDING;
        let img;

        do {
            img = await getNextImage(store.imagesDraftList, (list) => { store.imagesDraftList = list; });

            if (img) store.imagesSecondList.push(img);
        } while (img && store.imagesDraftList.length !== 0);
        store.imagesSecondListState = FETCH.DONE;
    };

    useEffect(() => {
        console.log('stage:', stage);
        if (images.length === 0) return;

        asyncAction(async () => {
            console.log('images:', toJS(images));
            store.imagesDraftList = images;
            if (!store.primaryImage) await loadPrimaryImage();

            loadShortList()
                .then(() => {
                    console.log('store.imagesShortList:', store.imagesShortList);
                })
                .catch((e) => console.error(e));
        }).catch((e) => console.error(e));
    }, [images.length]);

    useEffect(() => {
        console.log('stage:', stage);
        if ((stage === STAGE.FAILED_PARSE_SITE) || (images.length === 0 && stage === STAGE.DONE)) {
            if (!store.primaryImage) {
                store.primaryImage = {
                    url: '',
                    icoVariant: BKMS_VARIANT.SYMBOL,
                };
            } else {
                store.imagesShortList = [
                    {
                        url: '',
                        icoVariant: BKMS_VARIANT.SYMBOL,
                    },
                ];

                store.imagesShortListState = FETCH.DONE;
            }
        }
    }, [stage]);

    useEffect(() => {
        if (store.imagesShortListState === FETCH.DONE && store.imagesShortList.length !== 0) {
            setTimeout(() => {
                store.showShortList = true;
            }, 300);
        } else {
            store.showShortList = false;
        }
    }, [store.imagesShortListState, store.imagesShortList.length]);

    return (
        <CardMedia className={classes.cover} ref={ref}>
            {stage === STAGE.WAIT_REQUEST && (
                <Stub icon={URLIcon} description={t('editor.helper.enterRequest')} />
            )}
            {stage === STAGE.WAIT_RESULT && (
                <Stub icon={URLIcon} description={t('editor.helper.selectResult')} />
            )}
            {stage === STAGE.WAIT_NAME && (
                <Stub icon={URLIcon} description={t('editor.helper.enterName')} />
            )}
            {stage === STAGE.PARSING_SITE && !store.primaryImage && (
                <Stub description="Getting site info">
                    <CircularProgress color="primary" />
                </Stub>
            )}
            {stage === STAGE.DONE && !store.primaryImage && (
                <Stub description="Search site favicon">
                    <CircularProgress color="primary" />
                </Stub>
            )}
            {store.primaryImage && (
                <Scrollbar
                    onScroll={handleScrollStart}
                    classes={{
                        trackY: classes.trackY,
                        thumbY: classes.thumbY,
                    }}
                >
                    <Box
                        display="flex"
                        flexDirection="column"
                        minHeight={store.heightContainer}
                        ref={listRef}
                    >
                        <ResizeDetector
                            handleHeight
                            onResize={(width, height) => {
                                console.log('card height:', height);
                                store.heightCard = height + 2 + 16;
                            }}
                        >
                            {() => (
                                <PreviewCard
                                    active={selectUrl === store.primaryImage.url}
                                    name={name}
                                    description={description}
                                    icoVariant={store.primaryImage.icoVariant}
                                    imageUrl={store.primaryImage.url}
                                    onClick={() => onClickPreview(store.primaryImage)}
                                />
                            )}
                        </ResizeDetector>
                        <Box
                            className={clsx(
                                classes.shortList,
                                store.lockIconsList && classes.lockIconsList,
                            )}
                            style={{
                                transform: `translateY(${
                                    store.lockIconsList
                                        ? (store.heightContainer - store.heightCard - (store.showShortList ? 120 : 0))
                                        : 0
                                }px)`,
                            }}
                        >
                            {store.imagesShortList.map(({ url, icoVariant }) => (
                                <PreviewCard
                                    key={url}
                                    active={selectUrl === url}
                                    name={name}
                                    description={description}
                                    icoVariant={icoVariant}
                                    imageUrl={url}
                                    onClick={() => onClickPreview({
                                        url,
                                        icoVariant,
                                    })}
                                />
                            ))}
                            {store.imagesSecondList.map(({ url, icoVariant }) => (
                                <PreviewCard
                                    key={url}
                                    active={selectUrl === url}
                                    name={name}
                                    description={description}
                                    icoVariant={icoVariant}
                                    imageUrl={url}
                                    onClick={() => onClickPreview({
                                        url,
                                        icoVariant,
                                    })}
                                />
                            ))}
                            {
                                store.imagesDraftList.length !== 0
                                && store.imagesSecondListState !== FETCH.DONE
                                && store.imagesSecondListState !== FETCH.FAILED
                                && (
                                    <Box className={classes.moreWrapper}>
                                        <Button
                                            variant="outlined"
                                            disabled={store.imagesSecondListState !== FETCH.WAIT}
                                            onClick={handleLoadSecondList}
                                        >
                                            {store.imagesSecondListState === FETCH.WAIT && t('editor.button.moreIcons')}
                                            {store.imagesSecondListState === FETCH.PENDING && t('common:search')}
                                        </Button>
                                    </Box>
                                )
                            }
                        </Box>
                        <Fade in={store.lockIconsList}>
                            <Typography variant="body2" className={clsx(classes.moreIcons, classes.helper)}>
                                {stage === STAGE.PARSING_SITE && t('editor.search.preview.parsing')}
                                {store.imagesShortListState === FETCH.PENDING && t('editor.search.preview.download')}
                                {
                                    store.imagesShortListState === FETCH.DONE
                                    && store.imagesShortList.length !== 0
                                    && t('editor.button.scrollToMore')
                                }
                            </Typography>
                        </Fade>
                    </Box>
                </Scrollbar>
            )}
        </CardMedia>
    );
}

export default observer(Preview);
export { STAGE };
