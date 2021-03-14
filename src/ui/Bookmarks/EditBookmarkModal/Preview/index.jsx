import React, { useEffect, Fragment, useCallback } from 'react';
import {
    CardMedia,
    Box,
    CircularProgress, Typography, Button, Collapse, Fade,
} from '@material-ui/core';
import { WarningRounded as WarnIcon, LinkRounded as URLIcon } from '@material-ui/icons';

import { makeStyles } from '@material-ui/core/styles';
import CardLink from '@/ui/Bookmarks/CardLink';
import Stub from '@/ui-components/Stub';
import { useTranslation } from 'react-i18next';
import { BKMS_VARIANT, FETCH } from '@/enum';
import { observer, useLocalObservable } from 'mobx-react-lite';
import Scrollbar from '@/ui-components/CustomScroll';
import clsx from 'clsx';
import { useResizeDetector } from 'react-resize-detector';

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
    shortList: { marginTop: 'auto' },
    moreIcons: { marginTop: 'auto' },
    moreWrapper: {
        width: '100%',
        padding: theme.spacing(2),
        paddingTop: 0,
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
        fontWeight: 800,
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
}));

const STAGE = {
    FAILED_PARSE_SITE: 'FAILED_PARSE_SITE',
    PARSING_SITE: 'PARSING_SITE',
    WAIT_REQUEST: 'WAIT_REQUEST',
    WAIT_RESULT: 'WAIT_RESULT',
    WAIT_NAME: 'WAIT_NAME',
    DONE: 'DONE',
};

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
    const { t } = useTranslation();
    const store = useLocalObservable(() => ({
        stateImageLoad: defaultImage ? FETCH.DONE : FETCH.WAIT,
        loadUrl: '',
        imagesDraftList: images,
        imagesShortList: [],
        imagesShortListState: FETCH.WAIT,
        heightContainer: 0,
        lockIconsList: true,
    }));

    const onResize = useCallback((width, height) => {
        store.heightContainer = height;
    }, []);

    const { ref } = useResizeDetector({ onResize });

    const handleScrollStart = (e) => {
        if (store.imagesShortListState === FETCH.DONE && e.deltaY > 0) {
            store.lockIconsList = false;
        }
    };

    const checkValidImage = async ({ url }) => new Promise(((resolve, reject) => {
        const imgCache = document.createElement('img');
        imgCache.onload = resolve;
        imgCache.onerror = reject;
        imgCache.src = url;
    }));

    const getNextBestImage = () => {
        if (store.imagesDraftList.length === 0) {
            return null;
        }

        let maxScoreId = 0;

        store.imagesDraftList.forEach(({ score }, id) => {
            if (store.imagesDraftList[maxScoreId].score < score) maxScoreId = id;
        });

        const bestImage = store.imagesDraftList[maxScoreId];

        store.imagesDraftList = store.imagesDraftList.filter(({ url }) => url !== bestImage.url);

        return {
            url: bestImage.url,
            icoVariant: bestImage.type,
        };
    };

    const getNextImage = async () => {
        const nextImage = getNextBestImage();
        const isValid = nextImage && await checkValidImage(nextImage);

        return !nextImage || isValid ? nextImage : getNextImage();
    };

    const loadShortList = async () => {
        store.imagesShortListState = FETCH.PENDING;
        let img;

        do {
            img = await getNextImage();

            if (img) store.imagesShortList.push(img);
        } while (img && store.imagesShortList.length < 4);
        store.imagesShortListState = FETCH.DONE;
    };

    useEffect(() => {
        console.log('images:', images);
        store.imagesDraftList = images;
        loadShortList()
            .then(() => {
                console.log('store.imagesShortList:', store.imagesShortList);
            })
            .catch((e) => console.error(e));
    }, [images.length]);

    useEffect(() => {
        console.log('stage:', stage);
    }, [stage]);

    return (
        <CardMedia className={classes.cover} ref={ref} onWheel={handleScrollStart}>
            {stage === STAGE.WAIT_REQUEST && (
                <Stub icon={URLIcon} description={t('bookmark.editor.helper.writeURL')} />
            )}
            {stage === STAGE.WAIT_RESULT && (
                <Stub icon={URLIcon} description={t('bookmark.editor.helper.selectResult')} />
            )}
            {stage === STAGE.WAIT_NAME && (
                <Stub icon={URLIcon} description={t('bookmark.editor.helper.writeName')} />
            )}
            {
                (
                    (stage === STAGE.PARSING_SITE && !defaultImage)
                    || (
                        (stage === STAGE.DONE || stage === STAGE.FAILED_PARSE_SITE)
                        && (store.stateImageLoad === FETCH.PENDING || store.stateImageLoad === FETCH.WAIT)
                    )
                ) && (
                    <Stub description="Search site favicon">
                        <CircularProgress color="primary" />
                    </Stub>
                )
            }
            {(stage === STAGE.DONE || stage === STAGE.FAILED_PARSE_SITE) && store.stateImageLoad === FETCH.FAILED && (
                <Box className={classes.warnMessage}>
                    <WarnIcon className={classes.warnIcon} />
                    {t('bookmark.editor.errorLoadIcon')}
                </Box>
            )}
            {
                (stage === STAGE.DONE || stage === STAGE.FAILED_PARSE_SITE || defaultImage)
                && store.stateImageLoad === FETCH.DONE
                && (
                    <Scrollbar
                        classes={{
                            trackY: classes.trackY,
                            thumbY: classes.thumbY,
                        }}
                    >
                        <Box display="flex" flexDirection="column" height={store.heightContainer}>
                            {defaultImage && (
                                <CardLink
                                    name={name}
                                    description={description}
                                    icoVariant={defaultImage.icoVariant}
                                    imageUrl={defaultImage.url}
                                    preview
                                    className={classes.card}
                                    onClick={() => onClickPreview(defaultImage)}
                                />
                            )}
                            <Fade in={store.lockIconsList}>
                                <Typography className={clsx(classes.moreIcons, classes.helper)}>
                                    {stage === STAGE.PARSING_SITE && 'Search more icons...'}
                                    {store.imagesShortListState === FETCH.PENDING && 'Loading more icons...'}
                                    {
                                        stage === STAGE.DONE
                                        && store.imagesShortListState === FETCH.DONE
                                        && store.imagesShortList.length !== 0
                                        && 'Scroll to more'
                                    }
                                </Typography>
                            </Fade>
                            {store.imagesShortListState === FETCH.DONE && store.imagesShortList.length !== 0 && (
                                <Box className={clsx(classes.shortList, store.lockIconsList && classes.lockIconsList)}>
                                    <Collapse in={!store.lockIconsList} collapsedHeight={190}>
                                        {store.imagesShortList.map(({ url, icoVariant }, index) => (
                                            <CardLink
                                                key={url}
                                                name={name}
                                                description={description}
                                                icoVariant={icoVariant}
                                                imageUrl={url}
                                                preview
                                                className={clsx(
                                                    classes.card,
                                                    index === store.imagesShortList.length - 1 && classes.bottomOffset,
                                                )}
                                                onClick={() => onClickPreview({
                                                    url,
                                                    icoVariant,
                                                })}
                                            />
                                        ))}
                                        {store.imagesDraftList.length !== 0 && (
                                            <Box className={classes.moreWrapper}>
                                                <Button variant="outlined">
                                                    More images
                                                </Button>
                                            </Box>
                                        )}
                                    </Collapse>
                                </Box>
                            )}
                        </Box>
                    </Scrollbar>
                )
            }
        </CardMedia>
    );
}

export default observer(Preview);
export { STAGE };
