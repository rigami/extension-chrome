import React, { useEffect, useCallback, useState } from 'react';
import {
    CardMedia,
    Box,
    CircularProgress,
    Typography,
    Button,
    Fade,
    Badge,
    Collapse,
    Tab,
    Tabs,
} from '@material-ui/core';
import {
    LinkRounded as URLIcon,
    DoneRounded as SelectIcon,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import { observer, useLocalObservable } from 'mobx-react-lite';
import clsx from 'clsx';
import { useResizeDetector } from 'react-resize-detector';
import { captureException } from '@sentry/react';
import CardLink from '@/ui/WorkingSpace/Bookmark/Card';
import Stub from '@/ui-components/Stub';
import { FETCH } from '@/enum';
import Scrollbar from '@/ui-components/CustomScroll';
import { STATE_EDITOR } from '@/ui/WorkingSpace/Bookmark/Editor/BookmarkEditor';

const useStyles = makeStyles((theme) => ({
    cover: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexDirection: 'column',
        flexGrow: 0,
        flexShrink: 0,
        // backgroundColor: theme.palette.type === 'dark' ? theme.palette.grey[900] : theme.palette.grey[200],
        width: theme.shape.dataCard.width + theme.spacing(4),
        borderRadius: 'inherit',
        borderTopRightRadius: 0,
        borderBottomRightRadius: 0,
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
        width: 'calc(100% - 20px)',
        textAlign: 'center',
        bottom: theme.spacing(2),
        zIndex: 1,
        fontFamily: theme.typography.fontFamily,
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
    activeCard: { boxShadow: `inset 0px 0px 0px 1px ${theme.palette.primary.main}` },
    badge: { '& svg': { fontSize: '1rem' } },
    badgePlace: { transform: 'scale(1) translate(30%, -40%)' },
    badgeInvisiblePlace: { transform: 'scale(0) translate(30%, -40%) !important' },
    hideList: { display: 'none' },
    primaryContainer: {
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1,
    },
    loadingPrimaryCard: {
        height: theme.spacing(3),
        padding: theme.spacing(0.25, 1),
        margin: theme.spacing(2, 2),
        marginBottom: 0,
        borderRadius: theme.shape.borderRadiusButtonBold,
        backgroundColor: theme.palette.background.backdrop,
        fontWeight: 800,
        fontFamily: theme.typography.specialFontFamily,
        fontSize: '0.7rem',
        color: theme.palette.text.secondary,
        display: 'flex',
        alignItems: 'center',
    },
    tabsRoot: {
        minHeight: theme.spacing(3),
        padding: theme.spacing(0.25),
        margin: theme.spacing(2, 2),
        marginBottom: 0,
        borderRadius: theme.shape.borderRadiusButtonBold,
    },
    tab: {
        fontSize: '0.7rem',
        minHeight: theme.spacing(3),
        padding: theme.spacing(0.25, 0.75),
        minWidth: theme.spacing(4),
        borderRadius: theme.shape.borderRadiusButton,
    },
    tabsIndicator: { borderRadius: theme.shape.borderRadiusButton },
}));

function PreviewCard(props) {
    const classes = useStyles();
    const { t } = useTranslation(['bookmark']);
    const {
        active,
        url,
        icoUrl,
        icoVariant,
        availableVariants = [],
        name,
        description,
        tagsFull,
        className: externalClassName,
        onClick,
        onChangeVariant,
    } = props;
    const [tempVariant, setTempVariant] = useState(icoVariant);

    console.log('icoVariant:', icoVariant, availableVariants, icoUrl);

    return (
        <Box>
            {availableVariants.length > 1 && (
                <Collapse in={active} unmountOnExit>
                    <Tabs
                        classes={{
                            root: classes.tabsRoot,
                            indicator: classes.tabsIndicator,
                        }}
                        indicatorColor="primary"
                        variant="scrollable"
                        value={icoVariant}
                        onChange={(event, newValue) => {
                            console.log('icoVariant: Set value:', newValue);
                            const urlParsed = new URL(icoUrl);
                            const query = urlParsed.searchParams;
                            query.set('type', newValue.toLowerCase());

                            onClick({
                                url: `${urlParsed.origin}${urlParsed.pathname}?${query}`,
                                icoVariant: newValue,
                            });
                            // if (onChangeVariant) onChangeVariant(newValue);
                        }}
                    >
                        {availableVariants.map((variant) => (
                            <Tab
                                className={classes.tab}
                                key={variant}
                                value={variant}
                                label={t(`editor.iconVariant.${variant}`)}
                            />
                        ))}
                    </Tabs>
                </Collapse>
            )}
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
                    url={url}
                    icoUrl={icoUrl}
                    preview
                    tagsFull={tagsFull}
                    onClick={() => onClick({
                        url: icoUrl,
                        icoVariant,
                    })}
                    className={clsx(active && classes.activeCard)}
                />
            </Badge>
        </Box>
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

    const onResizeCard = useCallback((width, height) => {
        console.log('card height:', height);
        store.heightCard = height + 2 + 16;
    }, []);

    const { ref } = useResizeDetector({ onResize });
    const { ref: cardRef } = useResizeDetector({
        onResize: onResizeCard,
        handleHeight: true,
    });

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
            .catch((e) => {
                captureException(e);
                store.primaryImagesState = FETCH.FAILED;
            });
    };

    const handleLoadSecondList = async () => {
        if (store.secondaryImagesState !== FETCH.WAIT && store.secondaryImagesState !== FETCH.FAILED) return;
        store.secondaryImagesState = FETCH.PENDING;

        service.loadSecondaryImages()
            .then(() => { store.secondaryImagesState = FETCH.DONE; })
            .catch((e) => {
                captureException(e);
                store.secondaryImagesState = FETCH.FAILED;
            });
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

    // Hack for update tags
    useEffect(() => {}, [service.tagsFull]);

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
                <Stub description={t('editor.search.gettingSiteInfo')}>
                    <CircularProgress color="primary" />
                </Stub>
            )}
            {service.state === STATE_EDITOR.SEARCH_DEFAULT_IMAGE && (
                <Stub description={t('editor.search.searchSiteFavicon')}>
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
                        >
                            <Box ref={cardRef} className={classes.primaryContainer}>
                                <Collapse in={service.defaultImage.state === FETCH.PENDING}>
                                    <Box className={classes.loadingPrimaryCard}>{t('common:loading')}</Box>
                                </Collapse>
                                <PreviewCard
                                    active={service.sourceIcoUrl === service.defaultImage.sourceUrl}
                                    name={service.name}
                                    description={service.useDescription && service.description}
                                    url={service.url}
                                    tagsFull={service.tagsFull}
                                    icoVariant={
                                        service.sourceIcoUrl !== service.defaultImage.sourceUrl
                                            ? service.defaultImage.icoVariant
                                            : service.icoVariant
                                    }
                                    availableVariants={service.defaultImage.availableVariants}
                                    icoUrl={
                                        service.sourceIcoUrl !== service.defaultImage.sourceUrl
                                            ? service.defaultImage.url
                                            : service.icoUrl
                                    }
                                    onClick={(overrideIcon) => service.setPreview({
                                        ...service.defaultImage,
                                        ...overrideIcon,
                                    })}
                                />
                            </Box>
                            <Box
                                className={clsx(
                                    classes.shortList,
                                    store.lockList && classes.lockList,
                                    (
                                        service.state === STATE_EDITOR.PARSING_SITE
                                        || store.primaryImagesState === FETCH.PENDING
                                    ) && classes.hideList,
                                )}
                                style={{
                                    transform: `translateY(${
                                        store.lockList
                                            ? (store.heightContainer - store.heightCard - (store.showPrimaryList ? 120 : 0))
                                            : 0
                                    }px)`,
                                }}
                            >
                                {[...service.primaryImages, ...service.secondaryImages].map((image) => (
                                    <PreviewCard
                                        key={image.url}
                                        active={service.sourceIcoUrl === image.sourceUrl}
                                        name={service.name}
                                        description={service.useDescription && service.description}
                                        icoVariant={service.sourceIcoUrl !== image.sourceUrl ? image.icoVariant : service.icoVariant}
                                        availableVariants={image.availableVariants}
                                        url={service.url}
                                        tagsFull={service.tagsFull}
                                        icoUrl={service.sourceIcoUrl !== image.sourceUrl ? image.url : service.icoUrl}
                                        onClick={(overrideIcon) => service.setPreview({
                                            ...image,
                                            ...overrideIcon,
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
