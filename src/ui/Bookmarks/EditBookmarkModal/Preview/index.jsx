import React, { useEffect } from 'react';
import {
    CardMedia,
    Box,
    CircularProgress,
} from '@material-ui/core';
import { WarningRounded as WarnIcon, LinkRounded as URLIcon } from '@material-ui/icons';

import { makeStyles } from '@material-ui/core/styles';
import CardLink from '@/ui/Bookmarks/CardLink';
import FullScreenStub from '@/ui-components/FullscreenStub';
import { useTranslation } from 'react-i18next';
import { BKMS_VARIANT, FETCH } from '@/enum';
import { useObserver, useLocalStore } from 'mobx-react-lite';

const useStyles = makeStyles((theme) => ({
    cover: {
        padding: theme.spacing(2),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexDirection: 'column',
        flexGrow: 0,
        flexShrink: 0,
        backgroundColor: theme.palette.type === 'dark' ? theme.palette.grey[900] : theme.palette.grey[200],
        boxSizing: 'content-box',
        width: 182,
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
    card: { marginTop: theme.spacing(2) },
}));

const STAGE = {
    PARSING_SITE: 'PARSING_SITE',
    WAIT_REQUEST: 'WAIT_REQUEST',
    WAIT_RESULT: 'WAIT_RESULT',
    WAIT_NAME: 'WAIT_NAME',
    DONE: 'DONE',
};

function Preview(props) {
    const {
        stage = STAGE.WAIT_REQUEST,
        name,
        imageUrl,
        icoVariant,
        description,
        categories,
        header,
        getNextValidImage = () => {},
    } = props;
    const classes = useStyles();
    const { t } = useTranslation();

    const store = useLocalStore(() => ({
        stateImageLoad: FETCH.WAIT,
        loadUrl: '',
    }));

    useEffect(() => {
        if (stage !== STAGE.DONE) {
            store.stateImageLoad = FETCH.WAIT;
            store.loadUrl = '';
            return;
        }

        store.stateImageLoad = FETCH.PENDING;
        if (!imageUrl || icoVariant === BKMS_VARIANT.SYMBOL) {
            store.stateImageLoad = FETCH.DONE;
            return;
        }

        const imgCache = document.createElement('img');
        imgCache.onload = () => {
            if (imgCache.src !== store.loadUrl) return;
            store.stateImageLoad = FETCH.DONE;
        };
        imgCache.onerror = () => {
            if (imgCache.src !== store.loadUrl) return;
            const nextImage = getNextValidImage();
            if (nextImage === null) {
                store.stateImageLoad = FETCH.FAILED;
            } else {
                store.stateImageLoad = FETCH.WAIT;
            }
        };
        imgCache.src = imageUrl;
        store.loadUrl = imgCache.src;
    }, [imageUrl, stage]);

    return useObserver(() => (
        <CardMedia
            className={classes.cover}
        >
            {stage === STAGE.WAIT_REQUEST && (
                <FullScreenStub
                    iconRender={(renderProps) => (<URLIcon {...renderProps} />)}
                    description={t('bookmark.editor.helper.writeURL')}
                />
            )}
            {stage === STAGE.WAIT_RESULT && (
                <FullScreenStub
                    iconRender={(renderProps) => (<URLIcon {...renderProps} />)}
                    description={t('bookmark.editor.helper.selectResult')}
                />
            )}
            {stage === STAGE.WAIT_NAME && (
                <FullScreenStub
                    iconRender={(renderProps) => (<URLIcon {...renderProps} />)}
                    description={t('bookmark.editor.helper.writeName')}
                />
            )}
            {stage === STAGE.DONE && header}
            {
                (
                    stage === STAGE.PARSING_SITE
                    || (stage === STAGE.DONE && (store.stateImageLoad === FETCH.PENDING || store.stateImageLoad === FETCH.WAIT))
                ) && (
                    <FullScreenStub>
                        <CircularProgress color="primary" />
                    </FullScreenStub>
                )
            }
            {stage === STAGE.DONE && store.stateImageLoad === FETCH.DONE && (
                <CardLink
                    name={name}
                    description={description}
                    categories={categories}
                    icoVariant={icoVariant}
                    imageUrl={imageUrl}
                    preview
                    className={classes.card}
                />
            )}
            {stage === STAGE.DONE && store.stateImageLoad === FETCH.FAILED && (
                <Box className={classes.warnMessage}>
                    <WarnIcon className={classes.warnIcon} />
                    {t('bookmark.editor.errorLoadIcon')}
                </Box>
            )}
        </CardMedia>
    ));
}

export default Preview;
export { STAGE };
