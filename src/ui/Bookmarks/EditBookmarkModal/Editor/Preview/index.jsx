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
import { STATE_EDITOR } from '@/ui/Bookmarks/EditBookmarkModal/Editor/BookmarkEditor';

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
    lockList: {
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

function Preview({ editorService: service }) {
    const classes = useStyles();
    const { t } = useTranslation(['bookmark']);
    const store = useLocalObservable(() => ({
        primaryImagesState: FETCH.WAIT,
        secondaryImagesState: FETCH.WAIT,
        heightContainer: 0,
        heightCard: 0,
        lockList: true,
        showPrimaryList: false,
    }));

    const onResize = useCallback((width, height) => {
        store.heightContainer = height;
    }, []);

    const { ref } = useResizeDetector({ onResize });
    const { ref: listRef, height: listHeight } = useResizeDetector();

    const handleScrollStart = ({ scrollTop: scrollTopNow }, { scrollTop: scrollTopBefore }) => {
        if (store.primaryImagesState === FETCH.DONE && scrollTopNow - scrollTopBefore > 0) {
            store.lockList = false;
        }
    };

    const loadShortList = () => {
        if (store.primaryImagesState !== FETCH.WAIT && store.primaryImagesState !== FETCH.FAILED) return;
        store.primaryImagesState = FETCH.PENDING;

        service.loadPrimaryImages()
            .then(() => { store.primaryImagesState = FETCH.DONE; })
            .catch(() => { store.primaryImagesState = FETCH.FAILED; });
    };

    const handleLoadSecondList = async () => {
        if (store.secondaryImagesState !== FETCH.WAIT && store.secondaryImagesState !== FETCH.FAILED) return;
        store.secondaryImagesState = FETCH.PENDING;

        service.loadSecondaryImages()
            .then(() => { store.secondaryImagesState = FETCH.DONE; })
            .catch(() => { store.secondaryImagesState = FETCH.FAILED; });
    };

    useEffect(() => {
        if (service.state === STATE_EDITOR.PARSING_SITE) {
            store.lockList = true;
            store.showPrimaryList = false;
            store.primaryImagesState = FETCH.WAIT;
            store.secondaryImagesState = FETCH.WAIT;
        }
        if (service.state === STATE_EDITOR.DONE && service.allImages.length > 0) {
            loadShortList();
        }
    }, [service.state]);

    useEffect(() => {
        if (store.primaryImagesState === FETCH.DONE && service.primaryImages.length !== 0) {
            setTimeout(() => {
                store.showPrimaryList = true;
            }, 300);
        } else {
            store.showPrimaryList = false;
        }
    }, [store.primaryImagesState, service.primaryImages.length]);

    return (
        <CardMedia className={classes.cover} ref={ref}>
            {service.state === STATE_EDITOR.WAIT_REQUEST && (
                <Stub icon={URLIcon} description={t('editor.helper.enterRequest')} />
            )}
            {service.state === STATE_EDITOR.WAIT_RESULT && (
                <Stub icon={URLIcon} description={t('editor.helper.selectResult')} />
            )}
            {!service.name && service.state === STATE_EDITOR.DONE && (
                <Stub icon={URLIcon} description={t('editor.helper.enterName')} />
            )}
            {service.state === STATE_EDITOR.PARSING_SITE && !service.defaultImage && (
                <Stub description="Getting site info">
                    <CircularProgress color="primary" />
                </Stub>
            )}
            {service.state === STATE_EDITOR.SEARCH_DEFAULT_IMAGE && (
                <Stub description="Search site favicon">
                    <CircularProgress color="primary" />
                </Stub>
            )}
            {
                (service.state === STATE_EDITOR.DONE || service.defaultImage)
                && service.name
                && (
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
                                        active={service.imageURL === service.defaultImage.url}
                                        name={service.name}
                                        description={service.useDescription && service.description}
                                        icoVariant={service.defaultImage.icoVariant}
                                        imageUrl={service.defaultImage.url}
                                        onClick={() => service.setPreview(service.defaultImage)}
                                    />
                                )}
                            </ResizeDetector>
                            <Box
                                className={clsx(
                                    classes.shortList,
                                    store.lockList && classes.lockList,
                                )}
                                style={{
                                    transform: `translateY(${
                                        store.lockList
                                            ? (store.heightContainer - store.heightCard - (store.showPrimaryList ? 120 : 0))
                                            : 0
                                    }px)`,
                                }}
                            >
                                {service.primaryImages.map(({ url, icoVariant }) => (
                                    <PreviewCard
                                        key={url}
                                        active={service.imageURL === url}
                                        name={service.name}
                                        description={service.useDescription && service.description}
                                        icoVariant={icoVariant}
                                        imageUrl={url}
                                        onClick={() => service.setPreview({
                                            url,
                                            icoVariant,
                                        })}
                                    />
                                ))}
                                {service.secondaryImages.map(({ url, icoVariant }) => (
                                    <PreviewCard
                                        key={url}
                                        active={service.imageURL === url}
                                        name={service.name}
                                        description={service.useDescription && service.description}
                                        icoVariant={icoVariant}
                                        imageUrl={url}
                                        onClick={() => service.setPreview({
                                            url,
                                            icoVariant,
                                        })}
                                    />
                                ))}
                                {
                                    service.allImages.length !== 0
                                    && store.secondaryImagesState !== FETCH.DONE
                                    && store.secondaryImagesState !== FETCH.FAILED
                                    && (
                                        <Box className={classes.moreWrapper}>
                                            <Button
                                                variant="outlined"
                                                disabled={store.secondaryImagesState !== FETCH.WAIT}
                                                onClick={handleLoadSecondList}
                                            >
                                                {store.secondaryImagesState === FETCH.WAIT && t('editor.button.moreIcons')}
                                                {store.secondaryImagesState === FETCH.PENDING && t('common:search')}
                                            </Button>
                                        </Box>
                                    )
                                }
                            </Box>
                            <Fade in={store.lockList}>
                                <Typography variant="body2" className={clsx(classes.moreIcons, classes.helper)}>
                                    {service.state === STATE_EDITOR.PARSING_SITE && t('editor.search.preview.parsing')}
                                    {store.primaryImagesState === FETCH.PENDING && t('editor.search.preview.download')}
                                    {
                                        store.primaryImagesState === FETCH.DONE
                                        && service.primaryImages.length !== 0
                                        && t('editor.button.scrollToMore')
                                    }
                                </Typography>
                            </Fade>
                        </Box>
                    </Scrollbar>
                )
            }
        </CardMedia>
    );
}

export default observer(Preview);
